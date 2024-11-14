import type { CounterReport } from '@qualweb/core';
import type { AccessibilityUtils } from '@qualweb/util';

// FIXME: this should be imported from utils, not declare externally. Unless
// we're defining the variable, we should not make assumptions abut its
// presence.
declare global {
  interface Window {
    AccessibilityUtils: typeof AccessibilityUtils;
  }
}

function executeCounter(): CounterReport {
  const report: CounterReport = {
    type: 'counter',
    data: {
      roles: {},
      tags: {}
    }
  };

  const elementList = window.qwPage.getElements('*');

  for (const element of elementList ?? []) {
    const role = window.AccessibilityUtils.getElementRole(element);
    const tag = element.getElementTagName();

    if (role) {
      if (report.data.roles[role] === undefined) {
        report.data.roles[role] = 0;
      }

      report.data.roles[role]++;
    }

    if (report.data.tags[tag] === undefined) {
      report.data.tags[tag] = 0;
    }
    report.data.tags[tag]++;
  }

  return report;
}

export { executeCounter };
