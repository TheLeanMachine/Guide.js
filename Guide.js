/*
 * Guide.js
 * https://github.com/TheLeanMachine/Guide.js
 *
 * Copyright (c) 2013 Kai Hoelscher
 * Licensed under the MIT license.
 */

// TODO [BUG] why does 'activateAll()' does not get called when button clicked?
// TODO [RATED][BUG] what happens if an un-activaed Guide gets deaktivated?
// TODO [RATED][TEST] Guide creation (valid params?)
// TODO [TEST] activate() and deactivate()
// TODO [TEST] Module exporting, e.g. for require.js (???)
// TODO [API] methods to clean up: destroyAll() -> detachListeners(), removeGuidesFromDom()
// TODO [RATED][FEATURE] New Guide type: GuidedTour() ...at first, just a collection of Guiders (rename: HelpBoxGuide() to 'Guider()'?)
// TODO [FEATURE] Move CSS styles to lib; pass CSS styles to guideConfig, otherwise renderer() draws a default theme
// TODO [FEATURE] Provide HTML template for Guide
// TODO [FEATURE] Render parameters? (etc. where to render: Re-implement fadeOut? Position clockwise? Relative to center? )
// TODO [RATED][FEATURE] Provide hooks (events) like 'guideRendered', 'guideHidden'
// TODO [RATED][FEATURE] Implement DefaultRenderAdapter that natively renders the helpbox (via HTML API?) ????
// TODO [REFACTOR] Use Array.prototype.slice() and co. instead of functions belonging to the object
// TODO [REFACTOR] use some memoization instead of calls to '_libCache[...]'(?)
// TODO [REFACTOR] Rename: displayDuration -> displayDurationsMillis
// TODO [REFACTOR] expose concrete 'classes' instead of generic 'newGuide()' method: HelpBox, GuidedTour,...
// TODO [REFACTOR] add Guide in DOM as child nodes(instead of sibling), make parent "position: relative;" and use this as starting point for rendering
// TODO [REFACTOR] Improve performance of methods like debugEnabled() oder renderer() (???)
// TODO [VALIDATION] Args of createHelpBoxGuide() -> set to reasonable defaults otherwise
(function (undefined) { // we always get 'undefined' here, since this code is directly invoked without arguments

  //
  // "constants"
  //

  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)
  var DEBUG_URL_HASH = 'debugGuideJs';
  var DOC_URL = 'https://github.com/TheLeanMachine/Guide.js/blob/master/README.md';



  //
  // private members
  //

  var _guides = []; // all Guides created by this lib
  var _lastAddedGuideId = 0; // incremented when Guide is created
  var _libCache = {};



  //
  // private functions
  //

  // TODO add doc(?)
  function registerGuide(helpBoxGuide) {
    _guides.push(helpBoxGuide);
  }

  /**
   * Deactivates all Guides (ATM this means to hide them).
   */
  function deactivateAll() {
    forEachIn(_guides, function(guide) {
      guide.deactivate();
    });
  }

  /**
   * Activates all Guides (ATM this means to display them, again).
   */
  function activateAll() {
    forEachIn(_guides, function(guide) {
      guide.activate();
    });
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
    var defaults = {
      text: 'This is the default text of a HelpBoxGuide',
      displayDuration: 1000,
      fadeOutMillis: 250
    };
    var validConfig = addDefaultsTo(clientConfig, defaults);
    
    return new HelpBoxGuide(validConfig);
  }

  function addDefaultsTo(targetObj, defaults) {
    defaults = defaults || {};
    var key;
    var defaultValue;
    var propertyNotDefined;

    for (key in defaults) {
      if (targetObj[key]) {
        continue;
      } else {
        if (defaults.hasOwnProperty(key)) {
          defaultValue = defaults[key];
          if (isString(defaultValue) && (key === 'text')) { // TODO "(key === 'text')" ...this ain't a good design, right?
            defaultValue = convertToHtml(defaultValue);
          }
          targetObj[key] = defaultValue;
        }
      }

    }
    return targetObj;
  }

  /**
   * A simple help box that gets displayed for a certain amount of time.
   * @param guideConfig TODO doc
   * @constructor
   */
  function HelpBoxGuide(guideConfig) {
    var guideId = _lastAddedGuideId++;
    var helpBoxCssId = 'guideJsHelpBox-' + guideId;
    var closeLinkCssId = 'guideJsHelpBoxCloseLink-' + guideId;
    var targetCssId = guideConfig.renderTarget;

    /**
     * Triggers the Guide to do its work: Display a help box, start a tour with Guiders etc.
     */
    function activate() { // TODO rename to 'augment()' or sth. else?
      var content = guideConfig.text;
      var fadeOutMillis = guideConfig.fadeOutMillis;
      var displayDuration = guideConfig.displayDuration;
      var html;
      var anchor = debugModeEnabled() ? DEBUG_URL_HASH : 'top';

      if (domService().domContainsGuide(helpBoxCssId)) {
        domService().showGuide(helpBoxCssId);
      } else {
        html = '<div id="' + helpBoxCssId + '" class="helpBox">' + content + '<br><a id="' + closeLinkCssId + '" href="#' + anchor + '">close</a></div>';
        domService().attachGuideTo(targetCssId, html, helpBoxCssId);
        logDebug('Attached Guide "#'+ helpBoxCssId +'" to DOM, as child of "#'+ targetCssId +'".');
      }

      timerService().delayFor(displayDuration, deactivate);

// TODO taskService / eventService ???
      domService().attachEventTo('click', closeLinkCssId, function() {
        deactivate();
      });
    }

    // TODO add doc
    function deactivate() {
// $('#' + helpBoxCssId).fadeOut(fadeOutMillis);
      domService().hideGuide(helpBoxCssId);
    }

    function isLoaded() {
      return true;
    }

    this.activate = activate;
    this.deactivate = deactivate;
    this.isLoaded = isLoaded;
  }

  // TODO doc
  function domService() {
    var cacheKey = 'domService';
    if (_libCache[cacheKey]) {
      return _libCache[cacheKey];
    }

    if (jQueryAvailable()) {
      return _libCache[cacheKey] = new JQueryDomService(GLOBAL_CONTEXT.jQuery);
    }

    logError('Cannot render any Guides: No appropriate lib found in global context.');
    return null;
  }

  // TODO add doc (rename to wrapJQuery() )
  function JQueryDomService($) {
    var renderedGuides = {};

    // TODO add doc
    function attachGuideTo(cssIdRenderTarget, html, cssIdGuideContainer) {
      $('#' + cssIdRenderTarget).prepend(html);
      rememberGuide(cssIdGuideContainer);
    }

    // TODO add doc
    function domContainsGuide(guideCssId) {
      return renderedGuides[guideCssId];
    }

    // TODO add doc
    function rememberGuide(guideCssId) {
      renderedGuides[guideCssId] = 'dummy'; // TODO sth. better that dummy value?
    }

    // TODO add doc
    function showGuide(guideCssId) {
      $('#' + guideCssId).show();
    }

    function hideGuide(guideCssId) {
      $('#' + guideCssId).hide();
    }

    // TODO add doc
    function attachEventTo(eventName, cssIdGuideContainer, fn) {
      $('#' + cssIdGuideContainer).on(eventName, fn);
    }

    this.attachGuideTo = attachGuideTo;
    this.showGuide = showGuide;
    this.hideGuide = hideGuide;
    this.attachEventTo = attachEventTo;
    this.domContainsGuide = domContainsGuide;
  }

  // TODO add doc
  function timerService() {
    var cacheKey = 'timerService';
    return _libCache[cacheKey] ? _libCache[cacheKey] : (_libCache[cacheKey] = new DefaultTimerService());
  }

  // TODO add doc
  function DefaultTimerService() {
    var timers = [];

    function delayFor(delayMillis, fn) {
      var timer = {
        timerId: null,
        start: function() {
          this.timerId = windowObj().setTimeout(fn, delayMillis);
        },
        stop: function() {
          windowObj().clearTimeout(this.timerId);
        }
      };
      timer.start();
      timers.push(timer);
    }

    function callEvery(intervalMillis, fn) {
      var timer = {
        timerId: null,
        start: function() {
          this.timerId = windowObj().setInterval(fn, intervalMillis);
        },
        stop: function() {
          windowObj().clearInterval(this.timerId);
        }
      };
      timer.start();
      timers.push(timer);
    }

    function stopAll() {
      forEachIn(timers, function(timer) {
        timer.stop();
      });
    }

    this.delayFor = delayFor;
    this.callEvery = callEvery;
    this.stopAll = stopAll;
  }



  //
  // Helper functions
  //

  function convertToHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function debugModeEnabled() {
    var cacheKey = 'debugModeEnabled';
    if (_libCache[cacheKey]) {
      return _libCache[cacheKey];
    }
    _libCache[cacheKey] = false;
    if (windowObj().location && windowObj().location.hash) {
      _libCache[cacheKey] = windowObj().location.hash === ('#' + DEBUG_URL_HASH);
    }
    return _libCache[cacheKey];
  }

  // TODO add doc
  function windowObj() {
    var cacheKey = 'windowObj';
    if (_libCache[cacheKey]) {
      return _libCache[cacheKey];
    }

    if (GLOBAL_CONTEXT.window) {
      _libCache[cacheKey] = GLOBAL_CONTEXT.window;
    } else {
      logError('No "window" object available in global context.');
    }
    return _libCache[cacheKey];
  }

  function jQueryAvailable() {
    return GLOBAL_CONTEXT.jQuery != null;
  }

  function commonJsAvailable() {
    return (typeof module !== 'undefined' && module.exports); // checks for node.js, too
  }

  function enderAvailable() {
    /*global ender:false */
    return typeof ender === 'undefined';
  }

  function requireJsAvailable() {
    /*global define:false */
    return (typeof define === "function") && define.amd;
  }

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

  function isObject(obj) {
    return obj === Object(obj);
  }

  function isArray(obj) {
    return Array.isArray || Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isFunction(fn) {
    return Object.prototype.toString.call(fn) === '[object Function]';
  }

  function isString(fn) {
    return Object.prototype.toString.call(fn) === '[object String]';
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
    log('[ERROR]', msg);
  }

  function logDebug(msg) {
    if (debugModeEnabled()) {
      log('[DEBUG]', msg);
    }
  }

  function log(level, msg) {
    /*global console:false */
    if (GLOBAL_CONTEXT.console) {
      GLOBAL_CONTEXT.console.log(level + ' GuideJs: ' + msg);
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

    // methods
    this.createHelpBoxGuide = createHelpBoxGuide;
    this.activateAll = activateAll;
    this.deactivateAll = deactivateAll;
  }



  //
  // Exporting Guide.js
  //

  if (commonJsAvailable()) {
    module.exports = new GuideJsApi();
  }
  if (enderAvailable()) {
    // add `guide` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode
    GLOBAL_CONTEXT['GuideJs'] = new GuideJsApi();
  }
  if (requireJsAvailable()) {
    /*global define:false */
    define([], function () {
      return new GuideJsApi();
    });
  }
}).call(this); // setting 'this' to the global context