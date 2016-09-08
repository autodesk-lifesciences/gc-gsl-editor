var homepageRegister = require('../../../../../test-e2e/fixtures/homepage-register');
var newProject = require('../../../../../test-e2e/fixtures/newproject');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var size = require('../../../../../test-e2e/fixtures/size');

var runCode = require('../fixtures/run-code');
var blockCount = require('../fixtures/block-count');

module.exports = {
  'Test cases where GSL code is run producing no output blocks': function (browser) {

    size(browser);
    homepageRegister(browser);
    newProject(browser);
    
    blockCount(browser, 1);

    browser
      .pause(1000)
      .waitForElementPresent('.ProjectDetail-heading-extensionList', 3000, 'expected Extension list to appear');

    clickElementText(browser, 'GSL Editor (S288C)');

    browser
      .waitForElementPresent('.GSLEditorLayout', 3000, 'expected extension to render')


    // Case 1 - Running code without any content
    runCode(
      browser,
      '',
      'Code executed successfully.'
    );

    browser
      .pause(2000)

    // Case 2 - Running invalid code.
    runCode(
      browser,
      'Invalid code',
      'Running this code resulted in errors. Please check the console for details.'
    )

    blockCount(browser, 1);

    browser
      .pause(2000)
      .end();
  }
};
