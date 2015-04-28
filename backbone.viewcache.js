/*!
 * backbone.viewcache.js v1.1.1
 * Copyright 2015, Ingmar Hergst
 * backbone.viewcache.js may be freely distributed under the MIT license.
 */
(function(root, factory){
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['backbone', 'underscore', 'jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like
    // environments that support module.exports, like Node.
    var Backbone = require('backbone'), _ = require('underscore');
    Backbone.$ = Backbone.$ || require('jquery');
    module.exports = factory(Backbone, _, Backbone.$);
  } else {
    // Browser globals.
    factory(root.Backbone, root._, root.Backbone.$);
  }
}(this, function(Backbone, _, $, undefined){

  var defaultConfig = {

    // Automatically save and restore the cached view’s scroll position.
    // Useful when re-inserting view elements into the DOM.
    retainScrollPosition: true,

    // Element that will be used for retaining the view’s scroll position.
    // Can be a selector string or DOM element.
    scrollElement: window,

    // Cached view’s expiry time in seconds, or falsy for no expiry.
    // Can be overridden per view with the view’s `setCacheExpiry` method.
    cacheExpiry: undefined,

    // Time in seconds to have Backbone.ViewCache automatically clear
    // expired views from the cache with `Backbone.ViewCache.beforeRoute`.
    // Defaults to the value of the "cacheExpiry" configuration setting.
    checkExpireds: undefined,

    // When restoring the cached view’s scroll position, scroll to the top of
    // `scrollElement` if the view currently has no saved scroll position.
    scrollToTopByDefault: true

  };

  var config = defaultConfig;

  // Store for Backbone.View instances.
  var cachedViews = {};

  // Holds the URL route fragment of the last visited view.
  var lastFragment;

  // Holds the time to determine whether expired views should be removed from
  // the cache.
  var clearExpiredsTime;

  function setClearExpiredsTime() {
    var expireTime = config.checkExpireds || config.cacheExpiry;

    if (expireTime) {
      clearExpiredsTime = _.now() + expireTime * 1000;
    }
  }

  // Updates the cached view’s scroll position for given fragment;
  // "save" or "restore", depending on the action parameter value.
  function scrollPosition(action, fragment) {
    var cachedView;

    if (config.retainScrollPosition) {
      cachedView = Backbone.ViewCache.get(fragment);
      cachedView && cachedView[action + 'ScrollPosition']();
    }
  }

  function removeFromCache(key) {
    delete cachedViews[key];
  }

  function removeFromCacheIfExpired(key) {
    var cachedView = cachedViews[key],
      expiry = cachedView && cachedView._cacheExpiry;

    if (expiry && _.now() > expiry) {
      removeFromCache(key);
    }
  }

  function clearCache(expireds) {
    var key, f = expireds ? removeFromCacheIfExpired : removeFromCache;

    for (key in cachedViews) {
      if (cachedViews.hasOwnProperty(key)) f(key);
    }
  }

  function getFragment(fragment) {
    return _.isString(fragment) ? fragment : Backbone.history.fragment;
  }

  // Add scroll position and cache expiry methods to Backbone.View.prototype.
  _.extend(Backbone.View.prototype, {

    saveScrollPosition: function() {
      this._scrollPosition = $(config.scrollElement).scrollTop();
    },

    restoreScrollPosition: function() {
      if (this._scrollPosition) {
        $(config.scrollElement).scrollTop(this._scrollPosition);
      } else if (config.scrollToTopByDefault) {
        $(config.scrollElement).scrollTop(0);
      }
    },

    setCacheExpiry: function(expirationSeconds) {
      if (expirationSeconds) {
        this._cacheExpiry = _.now() + expirationSeconds * 1000;
      }
    }

  });

  Backbone.ViewCache = {

    // Gets or sets the configuration.
    config: function(obj) {
      if (obj) {
        if (!obj.checkExpireds) {
          obj.checkExpireds = obj.cacheExpiry || defaultConfig.cacheExpiry;
        }

        config = _.defaults(obj, defaultConfig);
      }

      return config;
    },

    // Gets a view from the cache using the current or a given URL fragment.
    // Returns the view, or `undefined` if not in cache.
    get: function(fragment) {
      fragment = getFragment(fragment);
      removeFromCacheIfExpired(fragment);
      return cachedViews[fragment];
    },

    // Sets a view into the cache using the current or a given URL fragment.
    // Returns the view.
    //
    // Unless the view already has a cache expiry time, it will be set using
    // the "cacheExpiry" configuration setting value. This can also be forced
    // with the boolean `forceCacheUpdate` parameter.
    set: function(view, fragment, forceCacheUpdate) {
      if (_.isBoolean(fragment)) forceCacheUpdate = fragment;
      fragment = getFragment(fragment);

      if (!view._cacheExpiry || forceCacheUpdate) {
        view.setCacheExpiry(config.cacheExpiry);
      }

      // Initial set of `clearExpiredsTime` (to start auto-clearExpireds) when
      // the first view with a defined cache expiry time is set into the cache.
      if (!clearExpiredsTime && view._cacheExpiry) {
        setClearExpiredsTime();
      }

      cachedViews[fragment] = view;
      return view;
    },

    // Removes a view from the cache using the current or a given URL fragment.
    remove: function(fragment) {
      fragment = getFragment(fragment);
      removeFromCache(fragment);
    },

    // Removes all views from the cache.
    clear: function() {
      clearCache();
    },

    // Removes all expired views from the cache.
    clearExpireds: function() {
      clearCache(true);
    },

    // Pre-route hook. To be called manually, for example in your app's router
    // `execute` method. Necessary for scroll positions and auto-clearExpireds.
    beforeRoute: function() {
      if (!_.isUndefined(lastFragment)) {
        scrollPosition('save', lastFragment);

        // Store the last URL fragment for convenience.
        this.lastUrlFragment = lastFragment;

        // Clear expired views from the cache.
        if (clearExpiredsTime && _.now() > clearExpiredsTime) {
          clearCache(true);
          setClearExpiredsTime();
        }
      }
    },

    // Post-route hook. To be called manually, for example in your app's router
    // `execute` method. Necessary for scroll positions.
    afterRoute: function() {
      var fragment = getFragment();
      scrollPosition('restore', fragment);
      lastFragment = fragment;
    }

  };

  return Backbone.ViewCache;

}));
