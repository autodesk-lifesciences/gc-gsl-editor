var clickElementText = require('../../../../../test-e2e/fixtures/click-element-text');
var loadExtension = function(browser) {
  // NOTE: This only works if currently signed in
  browser
    // click user widget to open extension picker
    .waitForElementPresent('div.signed-in', 5000, 'expected user to be signed in')
    .click('div.signed-in')
    // click extensions on menu
    .waitForElementPresent('.menu-item:nth-of-type(2)', 5000, 'expected menu item to appear')
    .pause(1000)
    .click('.menu-item:nth-of-type(2)')
    .waitForElementPresent('.ExtensionPicker', 5000, 'expected dialog to appear')
    .waitForElementPresent('.ExtensionPicker-toggle', 5000, 'expected extension items to appear')
    .click('.modal-window .ExtensionPicker .ExtensionPicker-row:nth-of-type(3) .ExtensionPicker-cell .ExtensionPicker-toggle')
    .click('.modal-window .ExtensionPicker .ExtensionPicker-row:nth-of-type(3) .ExtensionPicker-cell .ExtensionPicker-toggle')
    .pause(4000)

  clickElementText(browser, 'Submit');

  browser
    .pause(2000)
}

module.exports = loadExtension;
