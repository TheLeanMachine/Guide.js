/*global require:true */
var GuideJs = require('../Guide.js');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports['GuideJs'] = {
  setUp:function (done) {
    done();
  },
  'loadGuide(): detect invalid config: empty config':function (test) {
    var failMsg = "Loading an empty Guide config should yield an Error.";

    test.expect(2);
    test.ok(GuideJs.loadGuide(undefined).isLoaded() === false, failMsg);
    test.ok(GuideJs.loadGuide(null).isLoaded() === false, failMsg);
    test.done();
  }
};
