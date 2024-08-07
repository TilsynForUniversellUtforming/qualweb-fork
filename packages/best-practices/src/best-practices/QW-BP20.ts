import { BestPractice } from '@qualweb/best-practices';
import BestPracticeObject from '../lib/BestPractice.object';
import { BestPracticeClass, ElementExists } from '../lib/applicability';
import Test from '../lib/Test.object';
import { Translate } from '@qualweb/locale';

@BestPracticeClass
class QW_BP20 extends BestPracticeObject {
  constructor(bestPractice: BestPractice, locale: Translate) {
    super(bestPractice, locale);
  }

  @ElementExists
  execute(element: typeof window.qwElement): void {

    const possibleLandmarkList = element.getElements('header:not([role]), [role=banner]');
    const landmarkList = possibleLandmarkList.filter(
      (element) => window.AccessibilityUtils.getElementRole(element) === 'banner'
    );

    if (landmarkList.length > 0) {
      const test = new Test();
      if (landmarkList.length < 2) {
        test.verdict = 'passed';
        test.resultCode = 'P1';
      } else {
        test.verdict = 'failed';
        test.resultCode = 'F1';
      }
      test.addElements(landmarkList);
      super.addTestResult(test);
    }
  }
}

export = QW_BP20;
