import type { Assertion } from '@qualweb/core/evaluation';
import type { QWElement } from '@qualweb/qw-element';
import { Test, Verdict } from '@qualweb/core/evaluation';
import type { ElementResult, RuleResult } from './types';
import { Rule } from './Rule.object';

abstract class CompositeRule extends Rule {
  abstract execute(element?: QWElement, rules?: Assertion[]): void;

  public conjunction(element: QWElement, rules: Assertion[]): void {
    const test = new Test();

    const selector = element.getElementSelector();
    const results = this.getAtomicRuleResultPerVerdict(selector, rules);
    const translation = this.translate(test.resultCode);
    if (results['failed']) {
      test.verdict = Verdict.FAILED;
      test.resultCode = 'F1';
      test.description = translation + results['failed'].code;
    } else if (results['warning']) {
      test.verdict = Verdict.WARNING;
      test.resultCode = 'W1';
      test.description = translation + results['warning'].code;
    } else if (results['passed']) {
      test.verdict = Verdict.PASSED;
      test.resultCode = 'P1';
      test.description = translation + results['passed'].code;
    }

    test.addElement(element);
    super.addTestResult(test);
  }

  public disjunction(element: QWElement, rules: Assertion[]): void {
    const test = new Test();

    const selector = element.getElementSelector();
    const results = this.getAtomicRuleResultPerVerdict(selector, rules);
    const translation = this.translate(test.resultCode);
    if (results['passed']) {
      test.verdict = Verdict.PASSED;
      test.resultCode = 'P1';
      test.description = translation + results['passed'].code;
    } else if (results['warning']) {
      test.verdict = Verdict.WARNING;
      test.resultCode = 'W1';
      test.description = translation + results['warning'].code;
    } else if (results['failed']) {
      test.verdict = Verdict.FAILED;
      test.resultCode = 'F1';
      test.description = translation + results['failed'].code;
    }

    test.addElement(element);
    super.addTestResult(test);
  }

  public getAtomicRuleResultPerVerdict(selector: string, rules: Assertion[]): RuleResult {
    const ruleResult = {} as RuleResult;
    for (const rule of rules ?? []) {
      if (rule) {
        for (const result of rule.results) {
          if (result.elements && result.elements[0].pointer === selector && !ruleResult[result.verdict]) {
            ruleResult[result.verdict] = { title: rule.name, code: rule.code };
          }
        }
      }
    }
    return ruleResult;
  }

  public getAtomicRuleResultForElement(selector: string, rules: Assertion[]): ElementResult {
    const ruleResult: ElementResult = {};
    for (const rule of rules ?? []) {
      ruleResult[rule.code] = { title: rule.name, code: rule.code, verdict: Verdict.INAPPLICABLE };
      for (const result of rule.results ?? []) {
        if (result.elements && result.elements[0].pointer === selector) {
          ruleResult[rule.code] = { title: rule.name, code: rule.code, verdict: result.verdict };
        }
      }
    }
    return ruleResult;
  }
}

export { CompositeRule };
