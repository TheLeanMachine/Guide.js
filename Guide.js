/*
 * Guide.js
 * https://github.com/TheLeanMachine/Guide.js
 *
 * Copyright (c) 2013 Kai Hoelscher
 * Licensed under the MIT license.
 */

// TODO: [BUG] what happens if an un-activaed Guide gets deaktivated?
// >>> TODO: [BUG] re-implement fadeOut of GUide
// TODO: [BUG] why does 'activateAll()' does not get calles when button clicked?
// >>> TODO: [BUG] guidejs_test: a) why does null check fail? b) what kind of error is thrown if no guideConfig is provided?
// TODO: [TEST] activate() and deactivate() AND
// TODO: [TEST] Module exporting, e.g. for require.js (???)
// TODO: [FEATURE] Provide hooks (events) like 'guideRendered', 'guideHidden'
// TODO: [FEATURE] Provide HTML template for Guide
// TODO: [FEATURE] Render parameters? (etc. where to render: Position clockwise? Relative to center?)
// TODO: [FEATURE] New Guide type: GuidedTour() ...at first, just a collection of Guiders
// TODO: [FEATURE] Implement DefaultRenderAdapter that natively renders the helpbox (via HTML API?) ????
// >>> TODO: [REFACTOR] renderHtmTo() [and subroutines!]: split in sub-modules etc. DomService(), EventService(), TaskService()
// TODO: [REFACTOR] add Guide in DOM as child nodes(instead of sibling), make parent "position: relative;" and use this as starting point for rendering
// TODO: [REFACTOR] Rename HelpBoxGuide to HelpBox (???)
// TODO: [REFACTOR] make use of renderAdapter()
// TODO: [REFACTOR] expose concrete 'classes' instead of generic 'newGuide()' method: HelpBox, GuidedTour,...
// TODO: [REFACTOR] Improve performance of methods like debugEnabled() oder renderer() (???)
// TODO: [VALIDATION] Args of createHelpBoxGuide() -> set to reasonable defaults otherwise
(function (undefined) { // we always get 'undefined' here, since this code is directly invoked without arguments

  //
  // "constants"
  //

  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)
  var COMMONJS_AVAILABLE = (typeof module !== 'undefined' && module.exports); // checks for node.js, too
  /*global ender:false */
  var ENDER_AVAILABLE = typeof ender === 'undefined';
  /*global define:false */
  var REQUIREJS_AVAILABLE = (typeof define === "function") && define.amd;
  var DEBUG_URL_HASH = 'debugGuideJs';
  var DOC_URL = 'https://github.com/TheLeanMachine/Guide.js/blob/master/README.md';

  //
  // module global members
  //

  var _guides = []; // all Guides created by this lib
  var _lastAddedGuideId = 0; // incremented when Guide is created
  var _libCache = {};


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
    var validConfig = {
      renderTarget:clientConfig.renderTarget,
      text:(clientConfig.text) ? clientConfig.text : defaultText,
      displayDuration:(clientConfig.displayDuration) ? clientConfig.displayDuration : defaultDisplayDuration,
      fadeOutMillis:(clientConfig.fadeOutMillis) ? clientConfig.displayDuration : defaultFadeOutMillis
    };
    return new HelpBoxGuide(validConfig);
  }

  function registerGuide(helpBoxGuide) {
    _guides.push(helpBoxGuide);
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
        logDebug('Display Guide with CSS-ID "'+ helpBoxCssId +'" (rendered to element with CSS-ID "'+ targetCssId +')"');
      } else {
        html = '<div id="' + helpBoxCssId + '" class="helpBox">' + content + '<br><a id="' + closeLinkCssId + '" href="#' + anchor + '">close</a></div>';
        domService().attachGuideTo(targetCssId, html, helpBoxCssId);
        logDebug('Rendered Guide with CSS-ID "'+ helpBoxCssId +'" to element with CSS-ID "'+ targetCssId +'"');
      }

// TODO eventService().scheduleFor(delayMillis, fn)
      setTimeout(function() {
       // TODO parametrize hide?
       // $('#' + helpBoxCssId).fadeOut(fadeOutMillis);
       domService().hideGuide(helpBoxCssId);
      }, displayDuration);

// TODO taskService / eventService ???
      domService().attachEventTo('click', closeLinkCssId, function() {
        deactivate();
      });
    }

    // TODO add doc
    function deactivate() {
      domService().hideGuide(helpBoxCssId);
    }

    function isLoaded() {
      return true;
    }

    this.activate = activate;
    this.deactivate = deactivate;
    this.isLoaded = isLoaded;
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

  // TODO doc
  function domService() {
    // TODO: use lib cache
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


  //
  // Helper functions
  //

  function debugModeEnabled() {
    var cacheKey = 'debugModeEnabled';
    if (_libCache[cacheKey]) {
      return _libCache[cacheKey];
    }
    _libCache[cacheKey] = false;
    if (GLOBAL_CONTEXT.location && GLOBAL_CONTEXT.location.hash) {
      _libCache[cacheKey] = GLOBAL_CONTEXT.location.hash === ('#' + DEBUG_URL_HASH);
    }
    return _libCache[cacheKey];
  }

  function jQueryAvailable() {
    return GLOBAL_CONTEXT.jQuery != null;
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