import type { QWElement } from '@qualweb/qw-element';
import { ElementExists } from '@qualweb/util/applicability';
import { Test, Verdict } from '@qualweb/core/evaluation';
import { Technique } from '../lib/Technique.object';

class QW_WCAG_T35 extends Technique {
  private readonly idMap = new Map<string, boolean>();

  @ElementExists
  execute(element: QWElement): void {
    const test = new Test();

    const id = element.getElementAttribute('id');

    if (id && !this.idMap.get(id)) {
      try {
        const elementsWithSameId = window.qwPage.getElements(`[id="${id}"]`, element);

        if (elementsWithSameId.length > 1) {
          test.verdict = Verdict.FAILED;
          test.resultCode = 'F1';
        } else {
          test.verdict = Verdict.PASSED;
          test.resultCode = 'P1';
        }

        test.addElements(elementsWithSameId);
        this.addTestResult(test);
      } finally {
        this.idMap.set(id, true);
      }
    }
  }
}

export { QW_WCAG_T35 };
