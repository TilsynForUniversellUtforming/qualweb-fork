import type { QWElement } from '@qualweb/qw-element';
import { ElementExists } from '@qualweb/common';
import { Test } from '@qualweb/common';
import { Verdict } from '@qualweb/common';
import { Technique } from '../lib/Technique.object';

class QW_WCAG_T3 extends Technique {
  @ElementExists
  execute(element: QWElement): void {
    const test = new Test();

    const formATT = element.getElementAttribute('form');

    let validFormAtt: QWElement[] = [];

    if (formATT) {
      validFormAtt = window.qwPage.getElements(`form[id="${formATT}"]`);
    }

    const hasParent = element.elementHasParent('form');
    const hasChild = element.elementHasChild('legend');
    const childText = element.getElementChildTextContent('legend');

    if (!hasParent && validFormAtt.length === 0) {
      test.verdict = Verdict.FAILED;
      test.resultCode = 'F1';
    } else if (!hasChild || (childText && childText.trim() === '')) {
      test.verdict = Verdict.FAILED;
      test.resultCode = 'F2';
    } else {
      test.verdict = Verdict.WARNING;
      test.resultCode = 'W1';
    }

    test.addElement(element);
    this.addTestResult(test);
  }
}

export { QW_WCAG_T3 };
