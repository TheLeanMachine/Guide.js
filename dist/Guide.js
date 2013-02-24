/*! Guide.js - v0.0.1 - 2013-02-24
* https://github.com/TheLeanMachine/Guide.js
* Copyright (c) 2013 Kai Hoelscher; Licensed MIT */

// TODO: [FEATURE] Guide parsing from JSON
// TODO: [BUG]     ...
// TODO: [DOC]     ...
// TODO: [TEST]    ...
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

  var DOC_URL = 'https://github.com/TheLeanMachine/Guide.js/blob/master/README.md';


  /**
   * Creates a new Guide based on the passed configuration.
   * @param guideConfig TODO doc
   */
  function newGuide(guideConfig) {
    var guide;

    try {
      guide = createGuideByType(guideConfig);
      return guide;
    } catch(err) {
      logError('Unable to load Guide: ' + err.message);
      return new EmptyGuide();
    }
  }

  function createGuideByType(guideConfig) {
    validateGuideConfig(guideConfig);

    return new HelpBoxGuide(guideConfig.activationHandler);
  }

  function validateGuideConfig(guideConfig) {
    if (!guideConfig) {
      throwError('"guideConfig" must not be empty.');
    }
  }

  function EmptyGuide() {
    // TODO imlement Guide interface (activate(), ...)

    this.isLoaded = function() { return false; };
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

    function isLoaded() {
      return true;
    }

    this.activate = activate;
  }

  /**
   * Creates a new Guide from a JSON definition.
   * @param jsonGuide the JSON representing the Guide for the website to be augmented
   */
  function parseGuideFromJson(jsonGuide) {
    logError('Not yet implemented.');
  }

  //
  // Helper functions
  //
  function logError(msg) {
    /*global console:false */
    if (GLOBAL_CONTEXT.console) {
     GLOBAL_CONTEXT.console.log('[ERROR] ' + msg);
    }
  }

  function throwError(msg) {
    throw new Error(msg + ' - Check the API docs at ' + DOC_URL);
  }

  /**
   * The API to be exported by this library.
   */
  function GuideJsApi() {
    this.version = '0.0.1';
    this.GUIDE_TYPES = GUIDE_TYPES;

    this.loadGuide = newGuide;
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
}).call(this); // setting 'this' to the global context