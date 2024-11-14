import type { QWElement } from '@packages/qw-element/src';
import { ElementExists, ElementHasChild } from '@shared/applicability';
import { Test } from '@shared/classes';
import { Verdict } from '@shared/types';
import { BestPractice } from '../lib/BestPractice.object';

class QW_BP24 extends BestPractice {
  @ElementExists
  @ElementHasChild('*')
  execute(element: QWElement): void {
    const test = new Test();
    const children = element.getElementChildren();
    let allChildrenValid = true;
    children.map((child) => {
      const role = window.AccessibilityUtils.getElementRole(child);
      const name = child.getElementTagName();
      if (name !== 'li' && role !== 'listitem') {
        allChildrenValid = false;
      }
    });

    if (allChildrenValid) {
      test.verdict = Verdict.PASSED;
      test.resultCode = 'P1';
    } else {
      test.verdict = Verdict.FAILED;
      test.resultCode = 'F1';
    }
    test.addElement(element);
    this.addTestResult(test);
  }
}

export { QW_BP24 };
