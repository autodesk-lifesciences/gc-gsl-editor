
var blockCount = function(browser, expectedCount) {

  // count the number of blocks.
  browser.execute(function() {
    return window.constructor.api.projects.projectListAllBlocks(
      window.constructor.api.projects.projectGetCurrentId()).length;

  }, [], function(result) {
    var count = result.value;
    browser.assert.equal(count, expectedCount, 'expected ' + expectedCount + ' block(s) in the project.');
  });
};

module.exports = blockCount;
