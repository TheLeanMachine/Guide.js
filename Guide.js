/*
 * Guide.js
 * https://github.com/TheLeanMachine/Guide.js
 *
 * Copyright (c) 2013 Kai Hoelscher
 * Licensed under the MIT license.
 */

// TODO: [FEATURE] ...
// TODO: [BUG]     ...
// TODO: [DOC]     ...
// TODO: [TEST]    ...

(function (undefined) { // we always get 'undefined', since this code is directly invoked without arguments!

  //
  // 'constants'
  //
  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)
  var COMMONJS_AVAILABLE = (typeof module !== 'undefined' && module.exports); // checks for node.js, too
  var ENDER_AVAILABLE = typeof ender === 'undefined'; // global ender:false
  var REQUIREJS_AVAILABLE = (typeof define === "function") && define.amd; // global define:false

  /**
   *
   * @param configOptions object containing configuration in the form 'key' -> 'value'
   * @constructor
   */
  function Guide(configOptions) {
    var thisGuide = this;

    function printItBig(out) {
      return window.alert(out);
    }

    this.printItBig = printItBig;
  }

  //
  // Helper functions
  //
  /**
   * The exported API of this library.
   */
  function GuideJsApi() {
    this.version = '0.0.1';
    this.Guide = Guide;
  }

  //
  // Exporting Guide.js
  //
  if (COMMONJS_AVAILABLE) {
    module.exports = new GuideJsApi();
  }
  if (ENDER_AVAILABLE) {
    // add `guide` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode
    GLOBAL_CONTEXT['guide'] = new GuideJsApi();
  }
  if (REQUIREJS_AVAILABLE) {
    define([], function () {
      return new GuideJsApi();
    });

    /*
    define([], function () {

      function my_alert() {
        window.alert('Holy shit!');
      }

      return { myAlert: my_alert};
    });
*/
  }
}).call(this); // explicitly passing 'this' as the global context