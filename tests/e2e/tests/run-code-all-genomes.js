var homepageRegister = require('../../../../../test-e2e/fixtures/homepage-register');
var newProject = require('../../../../../test-e2e/fixtures/newproject');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var size = require('../../../../../test-e2e/fixtures/size');

var runCode = require('../fixtures/run-code');
var blockCount = require('../fixtures/block-count');
var loadExtension = require('../fixtures/load-extension');
var constants = require('../fixtures/extension-constants');

module.exports = {
  'Test cases running code from all genomes supported': function (browser) {
    size(browser);
    homepageRegister(browser);
    newProject(browser);

    blockCount(browser, 1);

    browser
      .pause(1000)
      .waitForElementPresent('.ProjectDetail-heading-extensionList', 3000, 'expected Extension list to appear')

    clickElementText(browser, 'GSL Editor');

    browser
      .waitForElementPresent('.GSLEditorLayout', 3000, 'expected extension to render')



    const code =
      'pADH5\r' +
      '#refgenome BY4741\r' + 
      'pADH5 \r'+
      '#refgenome BY4742 \r'+
      'pADH5 \r';

    // Running code that produces 2 constructs.
    runCode(
      browser,
      code,
      constants.codeExecuteSuccessString
    );

    browser
      .pause(8000)

    blockCount(browser, 7);

    // Verify the properties of the constructs.

    browser
      .pause(2000)
      .end()
  }
};