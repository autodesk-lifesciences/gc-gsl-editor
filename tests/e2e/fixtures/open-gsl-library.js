var openInventory = require('../../../../../test-e2e/fixtures/open-inventory.js');

var openGslLibrary = function(browser, term) {
  // open inventory at search tab
  openInventory(browser);
  browser
    .click('.InventoryGroup:nth-of-type(4) .InventoryGroup-heading')
    .waitForElementPresent('.InventoryItemGsl', 5000, 'expected the GSL operators to appear');
};

module.exports = openGslLibrary;