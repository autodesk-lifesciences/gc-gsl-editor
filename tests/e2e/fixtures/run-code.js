// assumes that the extension is open already.
var clickAt = require('../../../../../test-e2e/fixtures/clickAt');

var runGSLCode = function(browser, code, expectedStatus) {

  // select all first and then start typing the code - this would replace the existing code.
  /*
  browser
      .keys([browser.Keys.COMMAND, 'a'])
      .pause(1000) */
  // split the code and write into the editor.
  var codeLines = code.split('\r');
  codeLines.forEach(function(codeLine) {
    browser
      .keys(codeLine)
      .keys([browser.Keys.ENTER])
  });

  clickAt(browser, '#Run-a', 2, 2);

  browser
    .pause(5000)

  browser
    .getText('.StatusbarText:nth-of-type(1)', function(result) {
      browser.assert.equal(result.value, expectedStatus)
    });  
};

module.exports = runGSLCode;