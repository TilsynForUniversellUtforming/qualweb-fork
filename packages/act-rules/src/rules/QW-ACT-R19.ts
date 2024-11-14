import type { QWElement } from '@packages/qw-element/src';
import { ElementExists } from '@shared/applicability';
import { Test } from '@shared/classes';
import { Verdict } from '@shared/types';
import { AtomicRule } from '../lib/AtomicRule.object';

class QW_ACT_R19 extends AtomicRule {
  @ElementExists
  execute(element: QWElement): void {
    const tabIndex = element.getElementAttribute('tabindex');
    const isInAT = window.AccessibilityUtils.isElementInAT(element);

    if (isInAT && (!tabIndex || parseInt(tabIndex) >= 0)) {
      const test = new Test();

      const accessibleName = window.AccessibilityUtils.getAccessibleName(element);
      if (accessibleName && accessibleName.trim() !== '') {
        test.verdict = Verdict.PASSED;
        test.resultCode = 'P1';
      } else {
        test.verdict = Verdict.FAILED;
        test.resultCode = 'F1';
      }

      test.addElement(element, true, false, true);
      this.addTestResult(test);
    }
  }
}
export { QW_ACT_R19 };
