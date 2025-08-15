/**
 * This file builds validation tests for all currently implemented ACT rules.
 * For each implemented rule, the matching W3C/ACT-R test cases are pulled from
 * a local copy of testcases.json. A test suite is then built for the rule. This
 * saves a lot of copy-pasted code for dozens of virtually identical tests.
 */

import { expect } from 'chai';
import fetch from 'node-fetch';
import { launchBrowser } from './util';

import actTestCases from './fixtures/testcases.json';
import type { Browser, BrowserContext } from 'puppeteer';

const mapping: Record<string, string> = {
  'QW-ACT-R37': 'afw4f7',
 
};

/**
 * Outcome constants.
 */

const PASSED = 'passed';
const FAILED = 'failed';
const INAPPLICABLE = 'inapplicable';
const CANTTELL = 'cantTell';

/**
 * Mappings of testcase outcomes to their acceptable ACT rule outcomes. If an
 * ACT rule returns any of these results, it is considered conformant.
 */

const consistencyMapping = {
  passed: [PASSED, INAPPLICABLE, CANTTELL],
  failed: [FAILED, CANTTELL],
  inapplicable: [PASSED, INAPPLICABLE, CANTTELL]
};

describe('ACT rules', () => {
  for (const ruleToTest in mapping) {
    const ruleId = mapping[ruleToTest];

    describe(`${ruleToTest} (${ruleId})`, function () {
      let browser: Browser;
      let browserContext: BrowserContext;

      // Fire up Puppeteer before any test runs. All tests are run in their
      // own browser contexts, so restarting puppeteer itself should not be
      // necessary between tests.
      before(async () => browser = await launchBrowser());

      // Close the puppeteer instance once all tests have run.
      after(async () => await browser.close());

      // Create a unique browser context for each test.
      // FIXME: puppeteer no longer has createIncognitoBrowserContext() - is this a problem?
      beforeEach(async () => browserContext = await browser.createBrowserContext());

      // Make sure the browser contexts are shut down, as well.
      afterEach(async () => await browserContext?.close());

      // Filter the W3C/ACT-R test cases down to just their title, the URL to
      // the test case HTML, and the expected outcome.
      const tests = actTestCases.testcases
        .filter((t) => t.ruleId === ruleId)
        .map((t) => {
          return {
            title: t.testcaseTitle,
            url: t.url,
            outcome: t.expected
          };
        });

      for (const test of tests) {
        it(test.title, async function () {
          this.timeout(0);

          const page = await browserContext.newPage();
          await page.setBypassCSP(true);

          const sourceHtml = (await (await fetch(test.url)).text());

          // Script injection doesn't work on non-HTML pages. Instead, we insert
          // some empty HTML stuff and let the rule take over from there.
          if (test.url.endsWith('html'))
            await page.goto(test.url, { waitUntil: 'networkidle2' });
          else
            await page.setContent('<!DOCTYPE html><html nonHTMLPage=true><body>Empty</body></html>', { waitUntil: 'networkidle2' });

          // Inject @qualweb/act-rules and its dependencies into the page.

          await page.addScriptTag({
            path: require.resolve('@qualweb/qw-page')
          });

          await page.addScriptTag({
            path: require.resolve('@qualweb/util')
          });

          await page.addScriptTag({
            path: require.resolve('@qualweb/locale')
          });

          await page.addScriptTag({
            path: require.resolve('../dist/__webpack/act.bundle.js')
          });

          if (ruleId === '59br37') {
            await page.setViewport({
              width: 640,
              height: 512
            });
          }

          // Set up ACT rule module and run test for single rule.
          const report = await page.evaluate((ruleToTest, sourceHtml) => {
            // @ts-expect-error - ACTRules is injected via puppeteer.
            const actModule = new ACTRulesRunner({ include: [ruleToTest] }, 'en');
            actModule.configure();
            actModule.test({ sourceHtml });
            actModule.testSpecial();
            return actModule.getReport();
          }, ruleToTest, sourceHtml);

          expect(report.assertions).to.have.property(ruleToTest);

          // TODO: would be useful to check that atomic rules only report their
          // one result, while composite rules report its constituents.
          // expect(Object.keys(report.assertions)).to.have.lengthOf(1);

          // Retrieve the outcome. "warning" is QW-specific, so treat that as "cantTell" for these tests.
          const outcome =
            report.assertions[ruleToTest].metadata.outcome !== 'warning'
              ? report.assertions[ruleToTest].metadata.outcome
              : CANTTELL;

          // These implementation tests pass if the result from the ACT rule
          // falls within a range of acceptable outcomes.
          expect(outcome).to.be.oneOf(consistencyMapping[test.outcome as keyof typeof consistencyMapping]);
        });
      }
    });
  }
});
