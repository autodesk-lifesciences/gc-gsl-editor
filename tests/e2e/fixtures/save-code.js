// assumes that the extension is open already.
var clickAt = require('../../../../../test-e2e/fixtures/clickAt');

var saveGSLCode = function(browser, code) {

  browser
    .setValue('.ace_text-input', '')
    .setValue('.ace_text-input', code)

  clickAt(browser, '#Save-a', 2, 2);

  browser
    .pause(1000)

  browser
    .getText('.StatusbarText:nth-of-type(1)', function(result) {
      browser.assert.equal(result.value, 'Saved.')
  });  
};

module.exports = saveGSLCode;