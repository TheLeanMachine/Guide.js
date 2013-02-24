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

function isFalse(expr) {
  return expr === false;
}

exports['GuideJs'] = {
  setUp:function (done) {
    done();
  },
  'loadGuide(): detect invalid config: empty config':function (test) {
    var failMsg = "Loading an empty Guide config should not be possible.";

    test.expect(2);
    test.ok(isFalse(GuideJs.loadGuide(undefined).isLoaded()), failMsg);
    test.ok(isFalse(GuideJs.loadGuide(null).isLoaded()), failMsg);
    test.done();
  },
  'loadGuide(): detect invalid config: not an object':function (test) {
    var failMsg = "Loading a Guide config that's not an object should not be possible.";

    test.expect(4);
    test.ok(isFalse(GuideJs.loadGuide(1).isLoaded()), failMsg);
    test.ok(isFalse(GuideJs.loadGuide(4.2).isLoaded()), failMsg);
    test.ok(isFalse(GuideJs.loadGuide('foo').isLoaded()), failMsg);
    test.ok(isFalse(GuideJs.loadGuide(true).isLoaded()), failMsg);
    test.done();
  },
  'loadGuide(): detect invalid config: unknown Guide type':function (test) {
    var failMsg = "Loading a Guide config with an unknown Guide type should not be possible.";
    var guideConfig = { type: 'iDontExist in GUIDE_TYPES' };

    test.expect(1);
    test.ok(isFalse(GuideJs.loadGuide(guideConfig).isLoaded()), failMsg);
    test.done();
  }
};
