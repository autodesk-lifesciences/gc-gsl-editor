var homepageRegister = require('../../../../../test-e2e/fixtures/homepage-register');
var newProject = require('../../../../../test-e2e/fixtures/newproject');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var size = require('../../../../../test-e2e/fixtures/size');

var runCode = require('../fixtures/run-code');
var blockCount = require('../fixtures/block-count');

module.exports = {
  'Test cases where GSL code produces blocks': function (browser) {

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


    const code = '#name Construct1 \r' + 
      '#stitch \r' + 
      '/ATGG/ ; gHMG1[1586:~200E] \r'+
      '#name Construct2 \r'+
      'pADH5 \r';

    // Running code that produces 2 constructs.
    runCode(
      browser,
      code,
      'Program exited with status code: 0'
    );

    browser
      .pause(8000)

    blockCount(browser, 6);


    // Rerunning the code should result in the same number of constructs.
    /*runCode(
      browser,
      code,
      'Program exited with status code: 0'
    );

    browser
      .pause(2000)

    blockCount(browser, 6); */

    // Verify the properties of the constructs.

    browser
      .pause(2000)
      .end();
  }
};