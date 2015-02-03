# Backbone.ViewCache

Maintains a cache of [Backbone][backbone] views based on the view’s route fragment. Retains the view’s scroll position by default (useful when re-inserting view elements into the DOM).

Cache expiry can be set globally and per view instance.

## Installation

In a browser, include the plugin after jQuery, Underscore (or an equivalent library such as lodash), and Backbone have been included.

``` html
<script src="backbone.viewcache.js"></script>
```

*Backbone.ViewCache* can also be loaded as an [AMD module][amd] or required in CommonJS-like environments (like Node) – e.g. for use with [RequireJS][requirejs] or [Browserify][browserify]. It can be installed using the [Bower package manager][bower].

``` bash
bower install backbone.viewcache --save
```

``` javascript
// AMD
require(['backbone.viewcache'], function(ViewCache){ /* ... */ });
// Node.js
var ViewCache = require('backbone.viewcache');
```

## Usage

Use *Backbone.ViewCache* in your route handlers.

```javascript
home: function() {
  // Get the cached view for the current URL fragment.
  var homeView = Backbone.ViewCache.get();

  if (homeView) {
    // Re-activate the cached view.
    homeView.delegateEvents();
  } else {
    // Not in cache, instantiate a new view and cache it.
    homeView = Backbone.ViewCache.set(new HomeView());

    homeView.render();
  }

  // (Re-)insert the view element into the DOM.
}
```

```javascript
// Remove the current view from the cache.
Backbone.ViewCache.remove();

// Clear the cache.
Backbone.ViewCache.clear();

// Clear all expired views from the cache.
Backbone.ViewCache.clearExpireds();

// An optional URL fragment argument can be passed.
// If not passed, it defaults to Backbone.history.fragment
Backbone.ViewCache.get('search');
Backbone.ViewCache.set(new SearchView(), 'search');
Backbone.ViewCache.remove('search');
```

For retaining the scroll position and auto-clear expireds functionality, *Backbone.ViewCache* `beforeRoute` and `afterRoute` methods have to be called as pre- and post-route hooks.
This can be done in your router’s `execute` method (added in Backbone v1.0.0).

```javascript
execute: function(callback, args) {
  Backbone.ViewCache.beforeRoute();
  if (callback) callback.apply(this, args);
  Backbone.ViewCache.afterRoute();
}
```

## Configuration

Configure *Backbone.ViewCache* globally. Example with default configuration:

```javascript
Backbone.ViewCache.config({

  // Automatically save and restore the cached view’s scroll position.
  // Useful when re-inserting view elements into the DOM.
  retainScrollPosition: true,

  // Element that will be used for retaining the view’s scroll position.
  // Can be a selector string or DOM element.
  scrollElement: window,

  // Cached view’s expire time in seconds, or falsy for no expiry.
  // Can be overridden per view with the view’s `setCacheExpiry` method.
  cacheExpiry: undefined,

  // Time in seconds to have Backbone.ViewCache automatically clear
  // expired views from the cache with `Backbone.ViewCache.beforeRoute`.
  // Defaults to the value of the "cacheExpiry" global config.
  checkExpireds: undefined,

  // When restoring the cached view’s scroll position, scroll to the top of
  // `scrollElement` if the view currently has no saved scroll position.
  scrollToTopByDefault: true

});
```

## Methods added to Backbone.View.prototype

Backbone views are extended with three additional methods which are called internally and can also be called on demand: `saveScrollPosition`, `restoreScrollPosition`, and `setCacheExpiry`.

```javascript
// Expire the view in 5 minutes (takes precedence over global config).
homeView.setCacheExpiry(300);

// While the view is in the DOM, save its scroll position.
homeView.saveScrollPosition();

// While the view is in the DOM, restore its scroll position.
// (Scrolls to top if the "scrollToTopByDefault" setting is on and
//  the view currently has no saved scroll position.)
homeView.restoreScrollPosition();
```

## Limitations

Due to a [known Android bug][android], restoring the view’s scroll position doesn’t work in the stock browser for Android 4.0.x (Ice Cream Sandwich) and lower.

[backbone]: http://backbonejs.org/
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs]: http://requirejs.org/
[browserify]: http://browserify.org/
[bower]: http://bower.io/
[android]: https://code.google.com/p/android/issues/detail?id=19625
