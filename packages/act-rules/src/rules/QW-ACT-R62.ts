import type { QWElement } from '@packages/qw-element/src';
import { ElementExists } from '@shared/applicability';
import { Test } from '@shared/classes';
import { Verdict } from '@shared/types';
import { AtomicRule } from '../lib/AtomicRule.object';

class QW_ACT_R62 extends AtomicRule {
  @ElementExists
  execute(element: QWElement): void {
    const elementList = element.getElements('*');
    const inSequentialFocusList = elementList.filter((element) => {
      return window.AccessibilityUtils.isPartOfSequentialFocusNavigation(element);
    });

    if (inSequentialFocusList.length >= 1) {
      for (const inSequentialFocusElement of inSequentialFocusList ?? []) {
        const test = new Test(Verdict.WARNING, undefined, 'W1');
        test.addElement(inSequentialFocusElement);
        this.addTestResult(test);
      }
    }
  }
}

export { QW_ACT_R62 };
