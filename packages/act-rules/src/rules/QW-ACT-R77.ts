import type { QWElement } from '@qualweb/qw-element';
import { ElementExists } from '@qualweb/common';
import { Test } from '@qualweb/common';
import { Verdict } from '@qualweb/common';
import { AtomicRule } from '../lib/AtomicRule.object';

class QW_ACT_R77 extends AtomicRule {
  @ElementExists
  execute(element: QWElement): void {
    const role = element.getElementAttribute('role');

    if (
      !(
        role === 'scrollbar' ||
        (role === 'combobox' &&
          element.getElementAttribute('aria-expanded') &&
          element.getElementAttribute('aria-expanded') === 'true')
      )
    ) {
      return;
    }

    const test = new Test();

    const ariaControls = element.getElementAttribute('aria-controls');

    // the aria-controls is a list of IDs
    // check if any of the IDs references an element in the DOM
    const ids = ariaControls!.split(' ');
    let found = false;
    for (const id of ids) {
      if (document.getElementById(id)) {
        found = true;
        break;
      }
    }

    if (found) {
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
export { QW_ACT_R77 };
