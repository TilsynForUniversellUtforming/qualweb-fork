import type { QWElement } from '@qualweb/qw-element';
import {
  ElementExists,
  ElementHasText,
  ElementIsHTMLElement,
  ElementIsNot,
  ElementIsVisible
} from '@qualweb/util/applicability';
import { Test, Verdict } from '@qualweb/core/evaluation';
import { AtomicRule } from '../lib/AtomicRule.object';

class QW_ACT_R37 extends AtomicRule {
  @ElementExists
  @ElementIsHTMLElement
  @ElementIsNot(['html', 'head', 'body', 'script', 'style', 'meta'])
  @ElementIsVisible
  @ElementHasText
  execute(element: QWElement): void {
    // Must be visible in the flat tree
    const visible = (window as any).DomUtils.isElementVisible(element);
    if (!visible) return;

    // Out of scope if aria-hidden="true" on self/ancestor
    if (this.isAriaHiddenInTree(element)) return;

    // Content guards
    const hasTextNode = element.hasTextNode();
    const elementText = element.getElementOwnText();
    const placeholderAttr = element.getElementAttribute('placeholder');
    const hasPlaceholder = !!(placeholderAttr && placeholderAttr.trim() !== '');
    if (!hasTextNode && elementText.trim() === '' && !hasPlaceholder) return;

    // If the visible text looks like an icon and there is a different accessible name,
    // treat it as not human language (out of scope for contrast).
    const accName = this.getAccessibleNameOrFallback(element);
    if (
      this.isIconLikeText(elementText) &&
      accName &&
      accName.trim().toLowerCase() !== elementText.trim().toLowerCase()
    ) {
      const t = new Test();
      t.verdict = Verdict.PASSED; // out-of-scope (icon-like glyph; accessible name carries meaning)
      t.resultCode = 'P2';
      t.addElement(element);
      this.addTestResult(t);
      return;
    }

    // Exclude disabled widgets, their children, or elements in their accessible name
    const disabledWidgets = (window as any).disabledWidgets;
    const elementSelector = element.getElementSelector();
    for (const dw of disabledWidgets || []) {
      const selectors = (window as any).AccessibilityUtils.getAccessibleNameSelector(dw);
      if (dw && selectors && selectors.includes(elementSelector)) return;
      if (dw.getElementSelector() === elementSelector) return;
      const children = dw.getElementChildren?.();
      if (children) {
        for (const c of children) {
          if (c.getElementSelector() === elementSelector) return;
        }
      }
    }

    // Legacy: skip disabled role="group"
    const role = (window as any).AccessibilityUtils.getElementRole(element);
    if (role === 'group') {
      const disable = element.getElementAttribute('disabled') !== null;
      const ariaDisable = (element.getElementAttribute('aria-disabled') || '').toLowerCase() === 'true';
      if (disable || ariaDisable) return;
    }

    // Computed values
    const elementOpacity = parseFloat(this.getComputedValue(element, 'opacity')) || 1;
    const rawFG = this.getComputedValue(element, 'color') || 'black';
    const fontSize = this.getComputedValue(element, 'font-size');
    const fontWeight = this.getComputedValue(element, 'font-weight');
    const textShadow = this.getComputedValue(element, 'text-shadow') || 'none';

    // --- Text-shadow halo heuristic (optional pass) ---
    if (textShadow.trim() !== 'none') {
      const parts = textShadow.split(',');
      for (const raw of parts) {
        const part = raw.trim();

        // Extract a shadow color (named, hex, rgb/rgba)
        const colorMatch = part.match(
          /(rgba?\([^)]+\)|#(?:[0-9a-fA-F]{3,8})|\b[a-zA-Z]+\b)/
        );
        let shadowColor: any | undefined;
        if (colorMatch) shadowColor = this.parseShadowColorToken(colorMatch[0]);

        // Extract numbers (h, v, blur) – unitless zeros allowed
        const nums = [...part.matchAll(/\b(-?\d+(?:\.\d+)?)(?:px)?\b/g)];
        const h = nums[0] ? parseFloat(nums[0][1]) : 0;
        const v = nums[1] ? parseFloat(nums[1][1]) : 0;
        const blur =
          nums.length >= 3
            ? parseFloat(nums[2][1])
            : (nums.length >= 1 ? parseFloat(nums[nums.length - 1][1]) : 0);

        if (shadowColor && blur > 0) {
          const nearlyCentered = Math.hypot(h, v) <= Math.max(0.5, blur * 0.25);
          const fgForShadow = this.parseColorWithVars(element, rawFG);
          if (nearlyCentered && fgForShadow) {
            const haloContrast = this.getContrast(shadowColor, fgForShadow);
            if (this.hasValidContrastRatio(haloContrast, fontSize, this.isBold(fontWeight))) {
              const test = new Test();
              test.verdict = Verdict.PASSED;
              test.resultCode = 'P4'; // centered halo improves effective contrast
              test.addElement(element);
              this.addTestResult(test);
              return;
            }
          }
        }
      }

      // Compatibility warning for exactly centered small blur
      const props = textShadow.trim().split(' ');
      if (props.length === 6) {
        const vs = parseInt(props[3], 0);
        const hs = parseInt(props[4], 0);
        const blur = parseInt(props[5], 0);
        if (vs === 0 && hs === 0 && blur > 0 && blur <= 15) {
          const test = new Test();
          test.verdict = Verdict.WARNING;
          test.resultCode = 'W1';
          test.addElement(element);
          this.addTestResult(test);
          return;
        }
      }
    }
    // --- End text-shadow ---

    // Resolve a gradient string if present (background-image or background)
    const gradientString = this.getGradientString(element);

    // Background images/paint servers (URL, image-set) → can't tell
    const bgImgLower = (this.getComputedValue(element, 'background-image') || '').trim().toLowerCase();
    if (!gradientString && (this.isImagePaint(bgImgLower) || this.isImagePaint(this.getComputedValue(element, 'background')))) {
      const test = new Test();
      test.verdict = Verdict.WARNING;
      test.resultCode = 'W2';
      test.addElement(element);
      this.addTestResult(test);
      return;
    }

    // --- Gradient background branch (ACT = highest possible contrast) ---
    if (gradientString) {
      if (this.isHumanLikeText(elementText)) {
        const baseBG = this.resolveSolidBackgroundColor(element);

        // Foreground with element opacity applied
        const fg0 = this.parseColorWithVars(element, rawFG) || { red: 0, green: 0, blue: 0, alpha: 1 };
        const fg = { ...fg0, alpha: Math.max(0, Math.min(1, Math.round((fg0.alpha ?? 1) * elementOpacity * 100) / 100)) };

        // Collect background colors from gradient (transparent → baseBG)
        const stops = this.parseGradientColors(gradientString, element, baseBG);
        const effectiveBGs = stops.map(c => (c.alpha < 1 ? this.flattenColors(c, baseBG) : c));

        // Highest possible contrast across variants
        let maxContrast = 0;
        for (const bg of effectiveBGs) {
          const cr = this.getContrast(bg, fg);
          if (cr > maxContrast) maxContrast = cr;
        }

        const test = new Test();
        const valid = this.hasValidContrastRatio(maxContrast, fontSize, this.isBold(fontWeight));
        test.verdict = valid ? Verdict.PASSED : Verdict.FAILED;
        test.resultCode = valid ? 'P3' : 'F2';
        test.addElement(element);
        this.addTestResult(test);
        return;
      } else {
        const t = new Test();
        t.verdict = Verdict.PASSED; // out-of-scope (not human language)
        t.resultCode = 'P2';
        t.addElement(element);
        this.addTestResult(t);
        return;
      }
    }

    // --- Solid background branch ---
    // Start with background-color (or walk up); fallback to white canvas
    let parsedBG = this.parseColorWithVars(element, this.getComputedValue(element, 'background-color'));
    let elementAux: QWElement = element;

    while (
      parsedBG === undefined ||
      (parsedBG.red === 0 && parsedBG.green === 0 && parsedBG.blue === 0 && parsedBG.alpha === 0)
    ) {
      const parent = elementAux.getElementParent();
      if (!parent) break;

      // If parent has gradient in shorthand or image property, handle like gradient
      const parentGradient = this.getGradientString(parent);
      if (parentGradient) {
        const baseBG = this.resolveSolidBackgroundColor(parent);
        const fg0 = this.parseColorWithVars(element, rawFG) || { red: 0, green: 0, blue: 0, alpha: 1 };
        const fg = { ...fg0, alpha: Math.max(0, Math.min(1, Math.round((fg0.alpha ?? 1) * elementOpacity * 100) / 100)) };
        const stops = this.parseGradientColors(parentGradient, parent, baseBG);
        const effectiveBGs = stops.map(c => (c.alpha < 1 ? this.flattenColors(c, baseBG) : c));
        let maxContrast = 0;
        for (const bg of effectiveBGs) {
          const cr = this.getContrast(bg, fg);
          if (cr > maxContrast) maxContrast = cr;
        }
        const test = new Test();
        const valid = this.hasValidContrastRatio(maxContrast, fontSize, this.isBold(fontWeight));
        test.verdict = valid ? Verdict.PASSED : Verdict.FAILED;
        test.resultCode = valid ? 'P3' : 'F2';
        test.addElement(element);
        this.addTestResult(test);
        return;
      }

      // Otherwise keep walking up solid colors
      parsedBG = this.parseColorWithVars(parent, this.getComputedValue(parent, 'background-color'));
      elementAux = parent;
    }

    // Default to white if still nothing (canvas color)
    if (
      parsedBG === undefined ||
      (parsedBG.red === 0 && parsedBG.green === 0 && parsedBG.blue === 0 && parsedBG.alpha === 0)
    ) {
      parsedBG = { red: 255, green: 255, blue: 255, alpha: 1 };
    }

    // Foreground with element opacity applied
    let parsedFG = this.parseColorWithVars(element, rawFG);
    if (!parsedFG) parsedFG = this.parseColorWithVars(element, this.getComputedValue(element, 'color') || 'black');
    if (parsedFG && elementOpacity < 1) {
      parsedFG.alpha = Math.max(0, Math.min(1, Math.round(parsedFG.alpha * elementOpacity * 100) / 100));
    }

    // Placeholder contrast (if present)
    if (hasPlaceholder) {
      const phColorStr = this.getPlaceholderColor(element);
      const phColor = phColorStr ? this.parseRGBString(phColorStr) : undefined;
      if (phColor && parsedBG) {
        if (this.isHumanLikeText(placeholderAttr)) {
          const phTest = new Test();
          const phContrast = this.getContrast(parsedBG, phColor);
          const phValid = this.hasValidContrastRatio(phContrast, fontSize, this.isBold(fontWeight));
          phTest.verdict = phValid ? Verdict.PASSED : Verdict.FAILED;
          phTest.resultCode = phValid ? 'P5' : 'F3';
          phTest.addElement(element);
          this.addTestResult(phTest);
          return;
        } else {
          const phTest = new Test();
          phTest.verdict = Verdict.PASSED;
          phTest.resultCode = 'P2';
          phTest.addElement(element);
          this.addTestResult(phTest);
          return;
        }
      }
    }

    // Identical fg/bg → not visible → inapplicable (no result)
    if (parsedFG && this.equals(parsedBG, parsedFG)) return;

    // Normal text contrast
    const test = new Test();
    if (!parsedFG) {
      test.verdict = Verdict.WARNING;
      test.resultCode = 'W4'; // unknown/invisible foreground
      test.addElement(element);
      this.addTestResult(test);
      return;
    }

    if (this.isHumanLikeText(elementText)) {
      const contrastRatio = this.getContrast(parsedBG, parsedFG);
      const isValid = this.hasValidContrastRatio(contrastRatio, fontSize, this.isBold(fontWeight));
      test.verdict = isValid ? Verdict.PASSED : Verdict.FAILED;
      test.resultCode = isValid ? 'P1' : 'F1';
      test.addElement(element);
      this.addTestResult(test);
      return;
    } else {
      test.verdict = Verdict.PASSED; // out-of-scope (not human language)
      test.resultCode = 'P2';
      test.addElement(element);
      this.addTestResult(test);
      return;
    }
  }

  // ---------- Background helpers ----------

  /** Return a gradient string if present, from background-image OR background shorthand. */
  private getGradientString(node: QWElement): string | null {
    const bgImg = (this.getComputedValue(node, 'background-image') || '').trim();
    if (/\bgradient\(/i.test(bgImg)) return bgImg;

    const bgSh = (this.getComputedValue(node, 'background') || '').trim();
    if (/\bgradient\(/i.test(bgSh)) {
      const m = bgSh.match(/[\w-]*gradient\([^)]*\)/i);
      if (m) return m[0];
      return bgSh;
    }
    return null;
  }

  /** Resolve a solid background color up the tree; ignore images/gradients; fallback to canvas white. */
  private resolveSolidBackgroundColor(start: QWElement): any {
    let cur: QWElement | null = start;
    let guard = 0;
    while (cur && guard++ < 20) {
      const bgc = (this.getComputedValue(cur, 'background-color') || '').trim();
      const parsed = this.parseColorWithVars(cur, bgc);
      if (parsed && parsed.alpha > 0) return parsed;
      cur = cur.getElementParent();
    }
    return { red: 255, green: 255, blue: 255, alpha: 1 };
  }

  /** URL/image-set detection (not gradients). */
  private isImagePaint(value: string): boolean {
    const s = (value || '').toLowerCase();
    return /url\(/.test(s) || /image-set\(/.test(s);
  }

  // ---------- Gradient helpers ----------

  /** Extract color-like items from a gradient string. `transparent` → baseBG. */
  private parseGradientColors(gradient: string, owner: QWElement, baseBG: any): any[] {
    // Tokens: rgba/rgb (commas or spaces), hsla/hsl, hex, named, transparent
    const tokens = gradient.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|\b[a-zA-Z]+\b)/g) || [];
    const colors: any[] = [];
    for (const token of tokens) {
      const t = token.trim().toLowerCase();
      if (t === 'transparent') {
        // Treat as fully transparent stop revealing base background
        colors.push({ ...baseBG });
        continue;
      }
      // Filter out stray non-color words (e.g., 'linear', 'deg', 'to')
      if (/(^linear$|^radial$|^conic$|^to$|^deg$)/i.test(t)) continue;

      const c = this.parseColorWithVars(owner, token);
      if (c) colors.push(c);
    }
    if (colors.length === 0) colors.push({ ...baseBG });
    return colors;
  }

  // ---------- Text classification ----------

  /** True only if text contains letters (Unicode), not just symbols/ASCII art. */
  private isHumanLikeText(text: string): boolean {
    if (!text) return false;
    try {
      // Drop whitespace, punctuation, symbols, numbers, underscore
      const core = (text || '').replace(/[\s\p{P}\p{S}\p{Z}\d_]+/gu, '');
      return /[\p{L}\p{M}]/u.test(core);
    } catch {
      // Fallback if Unicode property escapes unsupported
      const core = (text || '').replace(/[\s0-9_\W]+/g, '');
      return /[A-Za-z]/.test(core);
    }
  }

  // ---------- Color parsing & math ----------

  private equals(color1: any, color2: any): boolean {
    return (
      color1.red === color2.red &&
      color1.green === color2.green &&
      color1.blue === color2.blue &&
      color1.alpha === color2.alpha
    );
  }

  /** Parse CSS colors: rgb/rgba (CSS3/4, including percent), hsl/hsla, hex, basic named, 'transparent'. */
  private parseRGBString(colorString: string): any {
    if (!colorString) return undefined;
    const raw = colorString.trim().toLowerCase();
    if (raw === 'transparent') return { red: 0, green: 0, blue: 0, alpha: 0 };

    // HEX
    const hex = raw.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
      const h = hex[1];
      const to255 = (s: string) => parseInt(s, 16);
      let r = 0, g = 0, b = 0, a = 255;
      if (h.length === 3) { r = to255(h[0] + h[0]); g = to255(h[1] + h[1]); b = to255(h[2] + h[2]); }
      else if (h.length === 4) { r = to255(h[0] + h[0]); g = to255(h[1] + h[1]); b = to255(h[2] + h[2]); a = to255(h[3] + h[3]); }
      else if (h.length === 6) { r = to255(h.slice(0, 2)); g = to255(h.slice(2, 4)); b = to255(h.slice(4, 6)); }
      else if (h.length === 8) { r = to255(h.slice(0, 2)); g = to255(h.slice(2, 4)); b = to255(h.slice(4, 6)); a = to255(h.slice(6, 8)); }
      return { red: r, green: g, blue: b, alpha: Math.round((a / 255) * 100) / 100 };
    }

    // Minimal named colors
    const named: Record<string, any> = {
      white: { red: 255, green: 255, blue: 255, alpha: 1 },
      black: { red: 0, green: 0, blue: 0, alpha: 1 },
      gray:  { red: 128, green: 128, blue: 128, alpha: 1 },
      grey:  { red: 128, green: 128, blue: 128, alpha: 1 }
    };
    if (raw in named) return { ...named[raw] };

    // CSS Color 4 rgb()/rgba(): commas or spaces; optional "/ alpha"; channels can be %
    const pctTo255 = (v: string) => Math.round(parseFloat(v) * 2.55);
    const chan = (v: string) => v.endsWith('%') ? pctTo255(v) : parseFloat(v);

    const rgbCss4 = raw.match(
      /^rgb\(\s*([0-9.]+%?)\s*(?:,|\s)\s*([0-9.]+%?)\s*(?:,|\s)\s*([0-9.]+%?)\s*(?:\/\s*([0-9.]+))?\s*\)$/i
    );
    if (rgbCss4) {
      const r = chan(rgbCss4[1]);
      const g = chan(rgbCss4[2]);
      const b = chan(rgbCss4[3]);
      const a = rgbCss4[4] !== undefined ? Math.round(parseFloat(rgbCss4[4]) * 100) / 100 : 1;
      return { red: r, green: g, blue: b, alpha: a };
    }

    const rgbaCss4 = raw.match(
      /^rgba\(\s*([0-9.]+%?)\s*(?:,|\s)\s*([0-9.]+%?)\s*(?:,|\s)\s*([0-9.]+%?)\s*(?:,|\s|\/\s*)([0-9.]+)\s*\)$/i
    );
    if (rgbaCss4) {
      const r = chan(rgbaCss4[1]);
      const g = chan(rgbaCss4[2]);
      const b = chan(rgbaCss4[3]);
      const a = Math.round(parseFloat(rgbaCss4[4]) * 100) / 100;
      return { red: r, green: g, blue: b, alpha: a };
    }

    // HSL/HSLA (commas or spaces; optional "/ alpha")
    const hslCss4 = raw.match(
      /^hsl\(\s*([-\d.]+)\s*(?:,|\s)\s*([-\d.]+)%\s*(?:,|\s)\s*([-\d.]+)%\s*(?:\/\s*([0-9.]+))?\s*\)$/i
    );
    const hslaCss4 = raw.match(
      /^hsla\(\s*([-\d.]+)\s*(?:,|\s)\s*([-\d.]+)%\s*(?:,|\s)\s*([-\d.]+)%\s*(?:,|\s|\/\s*)([0-9.]+)\s*\)$/i
    );
    const hslToRgb = (H: number, S: number, L: number) => {
      const Hn = ((H % 360) + 360) % 360;
      const C = (1 - Math.abs(2 * L - 1)) * S;
      const X = C * (1 - Math.abs(((Hn / 60) % 2) - 1));
      const m = L - C / 2;
      let r1 = 0, g1 = 0, b1 = 0;
      if (Hn < 60) [r1, g1, b1] = [C, X, 0];
      else if (Hn < 120) [r1, g1, b1] = [X, C, 0];
      else if (Hn < 180) [r1, g1, b1] = [0, C, X];
      else if (Hn < 240) [r1, g1, b1] = [0, X, C];
      else if (Hn < 300) [r1, g1, b1] = [X, 0, C];
      else [r1, g1, b1] = [C, 0, X];
      const to255 = (v: number) => Math.round((v + m) * 255);
      return { red: to255(r1), green: to255(g1), blue: to255(b1) };
    };
    if (hslCss4) {
      const H = parseFloat(hslCss4[1]);
      const S = parseFloat(hslCss4[2]) / 100;
      const L = parseFloat(hslCss4[3]) / 100;
      const A = hslCss4[4] !== undefined ? Math.round(parseFloat(hslCss4[4]) * 100) / 100 : 1;
      const rgb = hslToRgb(H, S, L);
      return { ...rgb, alpha: A };
    }
    if (hslaCss4) {
      const H = parseFloat(hslaCss4[1]);
      const S = parseFloat(hslaCss4[2]) / 100;
      const L = parseFloat(hslaCss4[3]) / 100;
      const A = Math.round(parseFloat(hslaCss4[4]) * 100) / 100;
      const rgb = hslToRgb(H, S, L);
      return { ...rgb, alpha: A };
    }

    return undefined;
  }

  private getRelativeLuminance(red: number, green: number, blue: number): number {
    const rSRGB = red / 255;
    const gSRGB = green / 255;
    const bSRGB = blue / 255;

    const r = rSRGB <= 0.03928 ? rSRGB / 12.92 : Math.pow((rSRGB + 0.055) / 1.055, 2.4);
    const g = gSRGB <= 0.03928 ? gSRGB / 12.92 : Math.pow((gSRGB + 0.055) / 1.055, 2.4);
    const b = bSRGB <= 0.03928 ? bSRGB / 12.92 : Math.pow((bSRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private flattenColors(fgColor: any, bgColor: any): any {
    const a = fgColor.alpha ?? 1;
    const red = (1 - a) * bgColor.red + a * fgColor.red;
    const green = (1 - a) * bgColor.green + a * fgColor.green;
    const blue = (1 - a) * bgColor.blue + a * fgColor.blue;
    const alpha = a + bgColor.alpha * (1 - a);
    return { red, green, blue, alpha };
  }

  private isBold(fontWeight: string): boolean {
    return !!fontWeight && ['bold', 'bolder', '700', '800', '900'].includes(fontWeight);
  }

  private getContrast(bgColor: any, fgColor: any): number {
    // If FG has alpha, flatten against BG
    if ((fgColor.alpha ?? 1) < 1) {
      fgColor = this.flattenColors(fgColor, bgColor);
    }
    const bL = this.getRelativeLuminance(bgColor.red, bgColor.green, bgColor.blue);
    const fL = this.getRelativeLuminance(fgColor.red, fgColor.green, fgColor.blue);
    return (Math.max(fL, bL) + 0.05) / (Math.min(fL, bL) + 0.05);
  }

  /** Large text uses 3:1, otherwise 4.5:1. */
  private hasValidContrastRatio(contrast: number, fontSize: string, isBold: boolean): boolean {
    const px = this.parseFontPx(fontSize);
    const isSmallFont = (isBold && px < 18.6667) || (!isBold && px < 24);
    const expected = isSmallFont ? 4.5 : 3;
    return contrast >= expected;
  }

  private parseFontPx(fontSize: string): number {
    if (!fontSize) return 16; // safe fallback
    const s = fontSize.trim().toLowerCase();

    if (s.endsWith('px')) return parseFloat(s);
    if (s.endsWith('pt')) return parseFloat(s) * (96 / 72);

    const rootPx = (): number => {
      try {
        const root = ((window as any).getComputedStyle?.(document?.documentElement)?.fontSize || '16px').toLowerCase();
        return root.endsWith('px') ? parseFloat(root) : 16;
      } catch { return 16; }
    };
    const toPx = (base: number, v: string) => {
      const n = parseFloat(v);
      return isNaN(n) ? base : n * base;
    };

    if (s.endsWith('rem')) return toPx(rootPx(), s);
    if (s.endsWith('em'))  return toPx(rootPx(), s);

    const keywords: Record<string, number> = {
      xxsmall: 9, xsmall: 10, small: 13, medium: 16, large: 18, xlarge: 24, xxlarge: 32
    };
    if (s in keywords) return keywords[s];

    const n = parseFloat(s);
    return isNaN(n) ? 16 : n;
  }

  // ---------- DOM & CSS helpers ----------

  private getNativeElement(node: QWElement): Element | null {
    const anyNode: any = node as any;
    return anyNode.element || anyNode.node || (typeof anyNode.getElement === 'function' ? anyNode.getElement() : null) || null;
  }

  private isAriaHiddenInTree(node: QWElement): boolean {
    let cur: QWElement | null = node;
    while (cur) {
      const v = (cur.getElementAttribute('aria-hidden') || '').toLowerCase();
      if (v === 'true') return true;
      cur = cur.getElementParent();
    }
    return false;
  }

  private getComputedValue(node: QWElement, prop: string): string {
    // Try QualWeb API first
    const val = (node as any).getElementStyleProperty?.(prop, null);
    if (val && val !== 'initial' && val !== 'inherit' && val !== '') return String(val);
    // Fallback to real computed style
    try {
      const native = this.getNativeElement(node);
      if (!native) return val || '';
      const cs = (window as any).getComputedStyle(native);
      if (!cs) return val || '';
      const viaGet = cs.getPropertyValue?.(prop);
      if (viaGet && viaGet !== 'initial' && viaGet !== 'inherit' && viaGet !== '') return String(viaGet);
      const anyCs: any = cs;
      if (anyCs && anyCs[prop]) return String(anyCs[prop]);
      return val || '';
    } catch {
      return val || '';
    }
  }

  private getPlaceholderColor(element: QWElement): string {
    try {
      const native = this.getNativeElement(element);
      if (!native) return '';
      const tryPseudo = (p: string): string => {
        const cs = (window as any).getComputedStyle(native, p);
        return cs && (cs as any).color ? String((cs as any).color) : '';
      };
      const candidates = [
        '::placeholder',
        '::-webkit-input-placeholder',
        '::-moz-placeholder',
        ':-ms-input-placeholder'
      ];
      for (const pseudo of candidates) {
        const c = tryPseudo(pseudo);
        if (c && c !== 'inherit' && c !== 'initial' && c !== 'unset') return c;
      }
      return '';
    } catch {
      return '';
    }
  }

  /** Resolve CSS custom properties var(--x[, fallback]) recursively with a small depth cap. */
  private resolveVarChain(owner: QWElement, value: string): string {
    if (!value) return value;
    const native = this.getNativeElement(owner);
    if (!native) return value;

    let out = String(value).trim();
    const css = (window as any).getComputedStyle(native);
    const MAX_DEPTH = 10;

    for (let i = 0; i < MAX_DEPTH && /\bvar\(/.test(out); i++) {
      out = out.replace(/var\(\s*--([A-Za-z0-9_-]+)\s*(?:,\s*([^)]+))?\)/g, (_m, name, fallback) => {
        const raw = css.getPropertyValue(`--${name}`);
        const resolved = raw ? String(raw).trim() : '';
        if (resolved) return resolved;
        return fallback ? String(fallback).trim() : '';
      }).trim();
    }
    return out;
  }

  /** Parse a color after expanding var() custom properties. */
  private parseColorWithVars(owner: QWElement, value: string | undefined): any {
    if (!value) return undefined;
    const resolved = this.resolveVarChain(owner, value);
    return this.parseRGBString(resolved);
  }

  /** Helper for text-shadow color names. */
  private parseShadowColorToken(token: string): any | undefined {
    const t = token.trim().toLowerCase();
    if (t === 'white') return { red: 255, green: 255, blue: 255, alpha: 1 };
    if (t === 'black') return { red: 0, green: 0, blue: 0, alpha: 1 };
    return this.parseRGBString(token);
  }

  /** Try to obtain the accessible name via AccessibilityUtils, aria-label, or title. */
  private getAccessibleNameOrFallback(el: QWElement): string {
    try {
      const a = (window as any).AccessibilityUtils;
      const fromUtil = a && typeof a.getAccessibleName === 'function' ? a.getAccessibleName(el) : '';
      if (fromUtil && fromUtil.trim() !== '') return fromUtil.trim();
    } catch { /* ignore */ }

    const aria = (el.getElementAttribute('aria-label') || '').trim();
    if (aria) return aria;

    const title = (el.getElementAttribute('title') || '').trim();
    if (title) return title;

    return '';
  }

  /** Heuristic: visible text that looks like an icon/symbol rather than human language. */
  private isIconLikeText(text: string): boolean {
    const t = (text || '').trim();
    if (!t) return false;

    // Common "text-icons"
    const iconSet = new Set([
      'x','X','×','+','-','•','…','⋯','≡','‹','›','«','»','←','→','↑','↓',
      '✓','✔','✕','✖','✗','★','☆','▶','◀','▲','▼'
    ]);

    if (t.length <= 2 && iconSet.has(t)) return true;

    // Symbols / punctuation only
    try {
      if (/^[\p{P}\p{S}]+$/u.test(t)) return true;
    } catch {
      // Fallback without Unicode property escapes
      if (/^[^A-Za-z0-9]+$/.test(t)) return true;
    }

    // Classic "x" used for close
    if (/^x$/i.test(t)) return true;

    return false;
  }
}

export { QW_ACT_R37 };
