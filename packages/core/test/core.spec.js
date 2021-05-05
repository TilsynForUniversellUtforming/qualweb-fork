import { QualWeb, generateEARLReport } from '../dist/index';
import { expect } from 'chai';

describe('Core', function () {
  it('Should evaluate one url', async function () {
    this.timeout(0);

    const qualweb = new QualWeb();

    await qualweb.start({ headless: true, args: ['--ignore-certificate-errors'] });

    const evaluations = await qualweb.evaluate({ url: 'http://www.acsa.org.pt/', execute: { act: true }, "act-rules": { rules: ['QW-ACT-R1'] } });
    console.log(JSON.stringify(evaluations, null, 2))
    const earlReports = generateEARLReport(evaluations);

    await qualweb.stop();

    expect(earlReports['http://www.acsa.org.pt/']['@graph'].length).to.be.equal(1);
  });
});
