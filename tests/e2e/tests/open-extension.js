/* Reusing existing fixtures for now */

var homepageRegister = require('../../../../../test-e2e/fixtures/homepage-register');
var testProject = require('../../../../../test-e2e/fixtures/testproject');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var size = require('../../../../../test-e2e/fixtures/size');

module.exports = {
  'Test opening the GSL extension on a pre-saved project': function (browser) {

    // maximize for graphical tests
    size(browser);
    homepageRegister(browser);
    testProject(browser);

    browser
      .pause(1000)
      .waitForElementPresent('.ProjectDetail-heading-extensionList', 5000, 'expected Extension list to appear');

    clickElementText(browser, 'GSL Editor (S288C)');

    browser.waitForElementPresent('.GSLEditorLayout', 5000, 'expected extension to render')
      .end();
    
  }
};