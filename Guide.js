/*
 * Guide.js
 * https://github.com/TheLeanMachine/Guide.js
 *
 * Copyright (c) 2013 Kai Hoelscher
 * Licensed under the MIT license.
 */

// TODO: [FEATURE] stop/stopAll() and resume/resumeAll()... or toggleActive()?
// TODO: [FEATURE] expose conrete 'classes' instead of generic 'newGuide()' method
// TODO: [FEATURE] Render parameters? (etc. where to render: Position clockwise? Relative to center?)
// TODO: [FEATURE] New Guide type: GuideTour()
// TODO: [FEATURE] Guide parsing from JSON
// TODO: [BUG]     ...
// TODO: [TEST]    Module exporting(?), e.g. for require.js
(function (undefined) { // we always get 'undefined', since this code is directly invoked without arguments!

  //
  // 'constants'
  //
  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)

  var GUIDES = [];

  var GUIDE_TYPES = {
    SIMPLE_HELP_BOX: 'simple_help_box'
  };

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
      GUIDES.push(guide);
      return guide;
    } catch(err) {
      logError('Unable to load Guide: ' + err.message);
      return new EmptyGuide();
    }
  }

  function createGuideByType(guideConfig) {
    validateGuideConfig(guideConfig);

    return new HelpBoxGuide(guideConfig);
  }

  function validateGuideConfig(guideConfig) {
    validateIsDefined(guideConfig, '"guideConfig" must not be empty.');
    validateIsObject(guideConfig, '"guideConfig" must be of type "Object".');
    validateHasKnownGuideType(guideConfig, '"guideConfig.type" is not defined or is an unknown type.');
    // TODO validateRenderAdaptor(...) - instance check etc.
  }

  function EmptyGuide() {
    // TODO implement Guide interface (activate(), ...)

    this.isLoaded = function() { return false; };
  }

  /**
   * A simple help box that gets displayed for a certain amount of time.
   * @param guideConfig TODO doc
   * @constructor
   */
  function HelpBoxGuide(guideConfig) {
    var renderAdapter = guideConfig.renderAdapter;
    var targetCssId = guideConfig.renderTarget;

    /**
     * Triggers the Guide to do its work: Display a help box, start a tour with Guiders etc.
     */
    function activate() { // TODO rename to 'augment()' or sth. else?

      var buttonCssId = guideConfig.renderTrigger;
      var content = guideConfig.text;
      var fadeOutMillis = guideConfig.fadeOutMillis;
      var displayDuration = guideConfig.displayDuration;

      renderAdapter.renderTo(targetCssId, content, buttonCssId, displayDuration, fadeOutMillis);
    }

    // TODO add doc
    function deactivate() {
      renderAdapter.hide(targetCssId); // naive implementation
    }

    function isLoaded() {
      return true;
    }

    this.activate = activate;
    this.deactivate = deactivate;
    this.isLoaded = isLoaded;
  }

  // TODO add doc
  function JQueryRenderAdapter($) {
    var helpBoxCssId = 'myTestHelpBox';

    // TODO add doc
    function renderTo(renderTarget, content, displayDuration, fadeOutMillis) {

      var helpBox;

      $(renderTarget).prepend('<div id="'+ helpBoxCssId +'"  class="helpBox"><h4>Immediate Help!</h4>' + content + '</div>');
      helpBox = renderTarget + " div.helpBox";
      setTimeout(function() {
        $(helpBox).fadeOut(fadeOutMillis);
      }, displayDuration);
    }

    function hide() {
      $('#' + helpBoxCssId).hide();
    }

    this.renderTo = renderTo;
    this.hide = hide;
  }

  /**
   * Deactivates all Guides (ATM this means to hide them).
   */
  function deactivateAll() {
    var i;

    for (i=0; i<GUIDES.length; ++i) {
      GUIDES[i].deactivate();
    }
  }

  /**
   * Activates all Guides (ATM this means to display them, again).
   */
  function activateAll() {
    var i;

    for (i=0; i<GUIDES.length; ++i) {
      GUIDES[i].activate();
    }
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
  function objectHasPropertyWithValue(obj, val) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === val) {
        return true;
      }
    }
    return false;
  }

  function validateHasKnownGuideType(guideConfig, msg) {
    if(!guideConfig.type || !objectHasPropertyWithValue(GUIDE_TYPES, guideConfig.type)) {
      throwError(msg);
    }
  }

  function validateIsDefined(variable, msg) {
    if (!variable) {
      throwError(msg);
    }
  }

  function validateIsObject(obj, msg) {
    if (!isObject(obj)) {
      throwError(msg);
    }
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  function isArray(obj) {
    return Array.isArray || Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
  }

  // TODO add isString(str)
/*

 // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
 each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
 _['is' + name] = function(obj) {
 return toString.call(obj) == '[object ' + name + ']';
 };
 });
*/

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
    // variables
    this.version = '0.0.1';
    this.GUIDE_TYPES = GUIDE_TYPES;
    this.JQueryRenderAdapter = JQueryRenderAdapter;

    // methods
    this.loadGuide = newGuide;
    this.activateAll = activateAll;
    this.deactivateAll = deactivateAll;
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