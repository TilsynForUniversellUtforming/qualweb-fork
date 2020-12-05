import { Dom } from '@qualweb/dom';
import puppeteer from 'puppeteer';
import { Evaluation } from '../dist/index';

describe('QualWeb page', function() {
  it('Testing qualweb page evaluation', async function() {
    this.timeout(60*1000);

    const url = 'http://www.appacdm-elvas.org ';

    const browser = await puppeteer.launch({headless:false});
    const dom = new Dom();
    const { sourceHtml, page ,validation} = await dom.getDOM(browser, {}, url);
    const evaluation = new Evaluation();
    const evaluationReport = await evaluation.evaluatePage(sourceHtml, page, { act: true,  wcag: true, bp: true }, {}, url,validation);
    const fs = require('fs')
      // Write data in 'Output.txt' . 
      fs.writeFile('Output.txt', JSON.stringify(evaluationReport.modules['wcag-techniques']['assertions'], null, 2), (err) => {
        // In case of a error throw err. 
        if (err) throw err;
      })
    console.log(evaluationReport.modules['wcag-techniques']['assertions']['QW-WCAG-T21']);
   // await dom.close();
   // await browser.close();

    //console.log(evaluationReport);
  });
});

//http://www.apce.org.pt/
//http://www.cm-caldas-rainha.pt/