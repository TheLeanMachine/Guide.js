/*
 * Guide.js
 * https://github.com/TheLeanMachine/Guide.js
 *
 * Copyright (c) 2013 Kai Hoelscher
 * Licensed under the MIT license.
 */

// TODO: [BUG] Adding a Guide multiple times adde multiple DOM nodes(!!!)
// TODO: [BUG] what happens if an un-activaed Guide gets deaktivated?
// TODO: [BUG] why does 'activateAll()' does not get calles when button clicked?
// >>> TODO: [BUG] guidejs_test: a) why does null check fail? b) what kind of error is thrown if no guideConfig is provided?
// TODO: [TEST] activate() and deactivate() AND
// TODO: [TEST] Module exporting, e.g. for require.js (???)
// TODO: [FEATURE] Provide hooks (events) like 'guideRendered', 'guideHidden'
// TODO: [FEATURE] Provide HTML template for Guide
// TODO: [FEATURE] Render parameters? (etc. where to render: Position clockwise? Relative to center?)
// TODO: [FEATURE] New Guide type: GuidedTour() ...at first, just a collection of Guiders
// TODO: [FEATURE] Implement DefaultRenderAdapter that natively renders the helpbox (via HTML API?) ????
// >>> TODO: [REFACTOR] add Guide in DOM as child nodes(instead of sibling), make parent "position: relative;" and use this as starting point for rendering
// TODO: [REFACTOR] Rename HelpBoxGuide to HelpBox (???)
// TODO: [REFACTOR] make use of renderAdapter()
// TODO: [REFACTOR] expose concrete 'classes' instead of generic 'newGuide()' method: HelpBox, GuidedTour,...
// TODO: [VALIDATION] Args of createHelpBoxGuide() -> set to reasonable defaults otherwise
(function (undefined) { // we always get 'undefined' here, since this code is directly invoked without arguments

  //
  // API "constants"
  //
  var GLOBAL_CONTEXT = this; // 'window' in the browser, or 'global' on the server (see very bottom of this file)

  var GUIDES = [];

  var lastAddedGuideId = 0;

  var DOC_URL = 'https://github.com/TheLeanMachine/Guide.js/blob/master/README.md';


  //
  // other "constants"
  //
  var CACHED_DEBUG_ENABLED = null;
  var DEBUG_URL_HASH = 'debugGuideJs';

  var RENDERER = null; // TODO add doc

  var COMMONJS_AVAILABLE = (typeof module !== 'undefined' && module.exports); // checks for node.js, too

  /*global ender:false */
  var ENDER_AVAILABLE = typeof ender === 'undefined';

  /*global define:false */
  var REQUIREJS_AVAILABLE = (typeof define === "function") && define.amd;

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

  // TODO add doc (rename fn?)
  function renderer() {
    if (RENDERER == null) {
      RENDERER = createDefaultRenderer();
    }
    return RENDERER;
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


      var anchor = debugEnabled() ? DEBUG_URL_HASH : 'top';
      var html = '<div id="'+ helpBoxCssId +'" class="helpBox">' + content + '<br><a id="'+ closeLinkCssId +'" href="#'+ anchor +'">close</a></div>';
      renderer().renderHtmlTo(html, targetCssId, helpBoxCssId, displayDuration, fadeOutMillis);

      // TODO Refactor: make API jQuery independent
      $('#' + closeLinkCssId).on('click', function(){
        deactivate();
      });
      logDebug('Register close handler on "#' + closeLinkCssId + '"');
    }

    // TODO add doc
    function deactivate() {
      renderer().hide(helpBoxCssId);
    }

    function isLoaded() {
      return true;
    }

    this.activate = activate;
    this.deactivate = deactivate;
    this.isLoaded = isLoaded;
  }

  // TODO add doc (rename to wrapJQuery() )
  function JQueryRenderAdapter($) {


    // TODO add doc
    function renderHtmlTo(html, cssIdRenderTarget, cssIdGuideContainer, displayDuration, fadeOutMillis) {
      var helpBox;

      // TODO a) client should add plain CSS-ID b) write addHtmlAsChildOf() method
      $('#' + cssIdRenderTarget).prepend(html);
      setTimeout(function() {
        $('#' + cssIdGuideContainer).fadeOut(fadeOutMillis);
      }, displayDuration);
      logDebug('Rendered Guide with CSS-ID "'+ cssIdGuideContainer +'" to element with CSS-ID "'+ cssIdRenderTarget +'"');
    }

    function hide(cssIdGuideContainer) {
      $('#' + cssIdGuideContainer).hide();
logDebug("...in" + cssIdGuideContainer);
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

  function jQueryAvailable() {
    return GLOBAL_CONTEXT.jQuery != null;
  }

  // TODO doc
  function createDefaultRenderer() {
    if (jQueryAvailable()) {
      return new JQueryRenderAdapter(GLOBAL_CONTEXT.jQuery);
    }
    throwError('Cannot render any Guides: No appropriate lib found in global context.'); // TODO Still an Error? is public?
    return null;
  }


  //
  // Helper functions
  //

  /**
   * @return TRUE, if debug mode is enabled
   */
  function debugEnabled() {
    var debugAnchor = "#"+DEBUG_URL_HASH;

    if (!CACHED_DEBUG_ENABLED) {
      if (GLOBAL_CONTEXT.location) {
        CACHED_DEBUG_ENABLED = GLOBAL_CONTEXT.location.hash && (GLOBAL_CONTEXT.location.hash === debugAnchor);
      } else {
        CACHED_DEBUG_ENABLED = false;
      }
    }
    return CACHED_DEBUG_ENABLED;
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
    if (debugEnabled()) {
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