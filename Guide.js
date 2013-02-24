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
// TODO: [TEST]    Parsing a Guide from JSON.

(function (undefined) { // we always get 'undefined', since this code is directly invoked without arguments!

  //
  // 'constants'
  //
  var GUIDE_TYPES = {
    SIMPLE_HELP_BOX: 'simple_help_box'
  };

  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)

  var COMMONJS_AVAILABLE = (typeof module !== 'undefined' && module.exports); // checks for node.js, too

  /*global ender:false */
  var ENDER_AVAILABLE = typeof ender === 'undefined';

  /*global define:false */
  var REQUIREJS_AVAILABLE = (typeof define === "function") && define.amd;


  /**
   * Creates a new Guide from a JSON definition.
   * @param jsonGuide the JSON representing the Guide for the website to be augmented
   */
  function parseGuideFromJson(jsonGuide) {
    return new HelpBoxGuide(jsonGuide.activationHandler);
  }



  /**
   * A simple help box that gets displayed when an event is triggerd.
   * @param activationHandler TODO doc
   * @constructor
   */
  function HelpBoxGuide(activationHandler) {
    /**
     * Triggers the Guide to do its work: Display a help box, start a tour with Guiders etc.
     */
    function activate() {
      activationHandler();
    }

    this.activate = activate;
  }


  //
  // Helper functions
  //

  /**
   * The API to be exported by this library.
   */
  function GuideJsApi() {
    this.version = '0.0.1';
    this.GUIDE_TYPES = GUIDE_TYPES;

    this.parseGuideFromJson = parseGuideFromJson;
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
    /*global define:false */
    define([], function () {
      return new GuideJsApi();
    });
  }
}).call(this); // explicitly passing 'this' as the global context