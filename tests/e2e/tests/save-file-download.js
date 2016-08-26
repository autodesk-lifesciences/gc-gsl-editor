var homepageRegister = require('../../../../../test-e2e/fixtures/homepage-register');
var testProject = require('../../../../../test-e2e/fixtures/testproject');
var newProject = require('../../../../../test-e2e/fixtures/newproject');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var size = require('../../../../../test-e2e/fixtures/size');

var runCode = require('../fixtures/run-code');
var saveCode = require('../fixtures/save-code');
var downloadItem = require('../fixtures/download-item');

module.exports = {
  'Test that the GSL code can be saved and downloaded': function (browser) {

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

    saveCode(browser, codeString);
    
    downloadItem(browser, 'gsl file');

    browser
      .pause(2000)
      .end()

  }
};