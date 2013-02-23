/*! Guide.js - v0.0.1 - 2013-02-23
* https://github.com/TheLeanMachine/Guide.js
* Copyright (c) 2013 Kai Hoelscher; Licensed MIT */

// TODO: [FEATURE] ...
// TODO: [BUG]     ...
// TODO: [DOC]     ...
// TODO: [TEST]    ...

(function (exports) {

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

  /************************************
   Exports
   ************************************/

  exports.Guide = Guide;
}(typeof exports === 'object' && exports || window));