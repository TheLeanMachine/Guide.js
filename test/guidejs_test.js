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
  'createHelpBoxGuide(): ___Xxx____':function (test) {
    var failMsg = "msg";

    test.expect(1);
    var guideConfig = {
      renderTarget:'#mainNav',
      text:'No one stands longer than me!',
      displayDuration:5000,
      fadeOutMillis:400
    };
    var guide = GuideJs.createHelpBoxGuide(guideConfig);
    test.ok(guide != null, failMsg);
    test.done();
  }
};
