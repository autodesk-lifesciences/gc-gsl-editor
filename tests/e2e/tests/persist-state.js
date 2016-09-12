var homepageRegister = require('../../../../../test-e2e/fixtures/homepage-register');
var testProject = require('../../../../../test-e2e/fixtures/testproject');
var newProject = require('../../../../../test-e2e/fixtures/newproject');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var size = require('../../../../../test-e2e/fixtures/size');

var runCode = require('../fixtures/run-code');
var loadExtension = require('../fixtures/load-extension');

module.exports = {
  'Test that the GSL extension persists its state': function (browser) {

    // maximize for graphical tests
    size(browser);
    homepageRegister(browser);
    newProject(browser);

    browser
      .pause(1000)
      .waitForElementPresent('.ProjectDetail-heading-extensionList', 5000, 'expected Extension list to appear');

    clickElementText(browser, 'GSL Editor (S288C)');

    browser.waitForElementPresent('.GSLEditorLayout', 5000, 'expected extension to render')

    // Running code to check persistence.
    const codeString = 'pADH4 ; mADH2';
    const statusString = 'Program exited with status code: 0';
    const resultStringStart = 'GSL compiler version';

    runCode(
      browser,
      codeString,
      statusString
    );

    // close the console
    
    // Assumes the Sequence Viewer is also loaded.
    clickElementText(browser, 'Sequence Viewer');

    browser
      .pause(1000)

    clickElementText(browser, 'GSL Editor (S288C)');

    // Verify that all the content persists.
    browser.expect.element('.ace_content:nth-of-type(1)').text.to.equal(codeString);

    browser.expect.element('.divResult:nth-of-type(1)').text.to.contain(resultStringStart);

    // close the extension and check if it persists.

    browser
      .pause(2000)
      .end()

  }
};