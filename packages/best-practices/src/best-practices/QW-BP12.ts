import { QWElement } from '@qualweb/qw-element';
import { ElementExists, ElementHasChild } from '@qualweb/common';
import { Test } from '@qualweb/common';
import { Verdict } from '@qualweb/common';
import { BestPractice } from '../lib/BestPractice.object';

class QW_BP12 extends BestPractice {
  @ElementExists
  @ElementHasChild('tr')
  execute(element: QWElement): void {
    const rows = element.getElements('tr');
    let firstRowChildren: QWElement[] = [];
    if (rows.length > 0) {
      firstRowChildren = rows[0].getElementChildren();

      let i, scope;
      let scopeCole = true;

      for (i = 1; i < firstRowChildren.length; i++) {
        if (
          firstRowChildren[i].getElementTagName() === 'td' ||
          (firstRowChildren[i].getElementTagName() === 'th' && scopeCole)
        ) {
          scope = firstRowChildren[i].getElementAttribute('scope');
          scopeCole = scope === 'col';
        }
      }
      let scopeRow = true;
      let row;

      for (i = 1; i < rows.length; i++) {
        if (scopeRow) {
          row = rows[i];
          const cells = row.getElements('td');
          if (cells.length > 0) {
            scope = cells[0].getElementAttribute('scope');
            scopeRow = scope === 'row';
          }
        }
      }

      const test = new Test();

      if (scopeCole && scopeRow) {
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
}

export { QW_BP12 };
