/*
 * Guide.js
 * https://github.com/TheLeanMachine/Guide.js
 *
 * Copyright (c) 2013 Kai Hoelscher
 * Licensed under the MIT license.
 */

// TODO: [BUG] When trying to close a HelpBoxGuide, ALL HelpBoxes are closed!
// TODO: [TEST] activate() and deactivate() AND
// TODO: [TEST] Module exporting, e.g. for require.js (???)
// >>> TODO: [FEATURE] Provide debug mode
// TODO: [FEATURE] Provide HTML template for Guide
// TODO: [FEATURE] Render parameters? (etc. where to render: Position clockwise? Relative to center?)
// TODO: [FEATURE] New Guide type: GuidedTour() ...at first, just a collection of Guiders
// TODO: [FEATURE] Implement DefaultRenderAdapter that natively renders the helpbox (via HTML API?) ????
// TODO: [FEATURE] Guide parsing from JSON
// TODO: [REFACTOR] Do we alwy
// TODO: [REFACTOR] Rename HelpBoxGuide to HelpBpx (???)
// TODO: [REFACTOR] make use of renderAdapter()
// TODO: [REFACTOR] remove loadGuide()
// TODO: [REFACTOR] expose concrete 'classes' instead of generic 'newGuide()' method: HelpBox, GuidedTour,...
// TODO: [VALIDATION] Args of createHelpBoxGuide() -> set to reasonable defaults otherwise
(function (undefined) { // we always get 'undefined' here, since this code is directly invoked without arguments

  //
  // 'constants'
  //
  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)

  var GUIDES = [];

  var lastAddedGuideId = 0;

  var GUIDE_TYPES = {
    SIMPLE_HELP_BOX: 'simple_help_box'
  };

  var RENDERER = null; // TODO add doc

  var COMMONJS_AVAILABLE = (typeof module !== 'undefined' && module.exports); // checks for node.js, too

  /*global ender:false */
  var ENDER_AVAILABLE = typeof ender === 'undefined';

  /*global define:false */
  var REQUIREJS_AVAILABLE = (typeof define === "function") && define.amd;

  var DOC_URL = 'https://github.com/TheLeanMachine/Guide.js/blob/master/README.md';

  function jQueryAvailable() {
    return GLOBAL_CONTEXT.jQuery != null;
  }

  /**
   * Creates a new Guide based on the passed configuration.
   * @param guideConfig TODO doc
   */
  function newGuide(guideConfig) {
    var guide;

    ++lastAddedGuideId;
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
    throwIfInvalidConfig(guideConfig);

    return new HelpBoxGuide(guideConfig);
  }

  function throwIfInvalidConfig(guideConfig) {
    throwIfNotDefined(guideConfig, '"guideConfig" must not be empty.');
    throwIfNoObject(guideConfig, '"guideConfig" must be of type "Object".');
    throwIfInvalidGuideType(guideConfig, '"guideConfig.type" is not defined or is an unknown type.');
    // TODO validateRenderAdaptor(...) - instance check etc.
  }

  function EmptyGuide() {
    // TODO implement Guide interface (activate(), ...)

    this.isLoaded = function() { return false; };
  }

  /**
   * Factory method for creating new {@link HelpBoxGuide} instances.
   *
   * @param guideConfig TODO doc
   */
  function createHelpBoxGuide(guideConfig) {
    var helpBoxGuide;
    try {
      helpBoxGuide = helpBoxFrom(guideConfig);
      registerGuide(helpBoxGuide);
    } catch (err) {
      logError(err.message);
    }
    return helpBoxGuide;
  }

  function helpBoxFrom(clientConfig) {
    var defaultText = 'This is the default text of a HelpBoxGuide';
    var defaultDisplayDuration = 1000;
    var defaultFadeOutMillis = 150;
    var renderAdapter = (clientConfig.renderAdapter && isObject(renderAdapter)) ? clientConfig.renderAdapter : renderer(); // TODO more renderAdapter checks?
    var validConfig = {
      renderAdapter:renderAdapter,
      renderTarget:clientConfig.renderTarget,
      text:(clientConfig.text) ? clientConfig.text : defaultText,
      displayDuration:(clientConfig.displayDuration) ? clientConfig.displayDuration : defaultDisplayDuration,
      fadeOutMillis:(clientConfig.fadeOutMillis) ? clientConfig.displayDuration : defaultFadeOutMillis
    };
    return new HelpBoxGuide(validConfig);
  }

  function renderer() {
    return RENDERER ? RENDERER : defaultRenderAdapter();
  }

  // TODO doc
  function defaultRenderAdapter() {
    if (jQueryAvailable()) {
      return new JQueryRenderAdapter(GLOBAL_CONTEXT.jQuery);
    }
    throwError('Cannot render any Guides: No appropriate lib found in global context.'); // TODO Still an Error? is public?
  }

  function registerGuide(helpBoxGuide) {
    GUIDES.push(helpBoxGuide);
  }

  /**
   * A simple help box that gets displayed for a certain amount of time.
   * @param guideConfig TODO doc
   * @constructor
   */
  function HelpBoxGuide(guideConfig) {
    var guideId = lastAddedGuideId++;
    var renderAdapter = guideConfig.renderAdapter;
    var targetCssId = guideConfig.renderTarget;

    /**
     * Triggers the Guide to do its work: Display a help box, start a tour with Guiders etc.
     */
    function activate() { // TODO rename to 'augment()' or sth. else?

      var content = guideConfig.text;
      var fadeOutMillis = guideConfig.fadeOutMillis;
      var displayDuration = guideConfig.displayDuration;

      renderAdapter.renderHtmlTo(targetCssId, content, displayDuration, fadeOutMillis, guideId);
    }

    // TODO add doc
    function deactivate() {
      renderAdapter.hide(guideId); // naive implementation
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
    var helpBoxCssIdPrefix = 'guideJsHelpBox-';
    var closeLinkCssIdPrefix = 'guideJsHelpBoxCloseLink-';

    // TODO add doc
    function renderHtmlTo(renderTarget, content, displayDuration, fadeOutMillis, guideId) {
      var helpBox;

      $(renderTarget).prepend('<div id="'+ cssIdHelpBox(guideId) +'" class="helpBox">' + content + '<br><a id="'+ cssIdCloseLink(guideId) +'" href="">close</a></div>');
      setTimeout(function() {
        $('#' + cssIdHelpBox(guideId)).fadeOut(fadeOutMillis);
      }, displayDuration);

      $('#' + cssIdCloseLink(guideId)).on('click', function(){
        hide(guideId);
      });
    }

    function hide(guideId) {
      $('#' + cssIdHelpBox(guideId)).hide();
    }

    function cssIdHelpBox(guideId) {
      return helpBoxCssIdPrefix + guideId;
    }

    function cssIdCloseLink(guideId) {
      return closeLinkCssIdPrefix + guideId;
    }

    this.renderHtmlTo = renderHtmlTo;
    this.hide = hide;
  }

  /**
   * Deactivates all Guides (ATM this means to hide them).
   */
  function deactivateAll() {
    forEachIn(GUIDES, function(guide) {
      guide.deactivate();
    });
  }

  /**
   * Activates all Guides (ATM this means to display them, again).
   */
  function activateAll() {
    forEachIn(GUIDES, function(guide) {
      guide.activate();
    });
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
  function forEachIn(array, fn) {
    var i;

    for (i=0; i<array.length; ++i) {
      fn(array[i]);
    }
  }

  function objectHasPropertyWithValue(obj, val) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === val) {
        return true;
      }
    }
    return false;
  }

  function throwIfInvalidGuideType(guideConfig, msg) {
    if(!guideConfig.type || !objectHasPropertyWithValue(GUIDE_TYPES, guideConfig.type)) {
      throwError(msg);
    }
  }

  function throwIfNotDefined(variable, msg) {
    if (!variable) {
      throwError(msg);
    }
  }

  function throwIfNoObject(obj, msg) {
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
    this.createHelpBoxGuide = createHelpBoxGuide;
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
    GLOBAL_CONTEXT['GuideJs'] = new GuideJsApi();
  }
  if (REQUIREJS_AVAILABLE) {
    /*global define:false */
    define([], function () {
      return new GuideJsApi();
    });
  }
}).call(this); // setting 'this' to the global context