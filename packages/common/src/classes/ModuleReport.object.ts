import type { ModuleType, Assertion, EvaluationReport } from '../types';
import { Guideline } from './Guideline.object';

export class ModuleReport {
  private readonly report: EvaluationReport;

  constructor(module: ModuleType) {
    this.report = {
      type: module,
      metadata: {
        passed: 0,
        warning: 0,
        failed: 0,
        inapplicable: 0
      },
      assertions: {}
    };
  }

  public getAssertions(assertion: string): Assertion {
    return this.report.assertions[assertion];
  }

  public addAssertionResult(assertion: Guideline): void {
    const code = assertion.getCode();
    this.report.assertions[code] = assertion.getFinalResults();
    this.report.metadata[this.report.assertions[code].metadata.outcome]++;
  }

  public getCopy(): EvaluationReport {
    return { ...this.report };
  }
}
