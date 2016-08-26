// assumes that the extension is open already.
var clickAt = require('../../../../../test-e2e/fixtures/clickAt');
var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');

var downloadItem = function(browser, elementText) {

  clickAt(browser, '#Download-a', 2, 2);

  browser
  	.waitForElementPresent('.menu-popup-container:nth-of-type(1)', 2000, 'expected the Download menu to appear');

  clickElementText(browser, elementText);

	browser
    .pause(4000)  // wait  for 4 seconds for the save dialog to appear.
    .keys(browser.Keys.ENTER);

};

module.exports = downloadItem;