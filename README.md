# Backbone.ViewCache

Maintains a view cache based on the view’s route fragments. Retains the view’s scroll position by default (useful when re-inserting into the DOM). Cache expiry can be set globally and per view instance.

## Installation

In a browser, include the plugin after jQuery, Underscore (or an equivalent library such as Lo-Dash), and Backbone have been included.

``` html
<script src="backbone.viewcache.js"></script>
```

*Backbone.ViewCache* can also be loaded as an [AMD module][amd] or required in CommonJS-like environments (like Node) – e.g. for use with [Require.js][requirejs] or [Browserify][browserify]. It can be installed using the [Bower package manager][bower].

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
  var homeView = Backbone.ViewCache.get();

  if (homeView) {
    // Re-activate the cached home view.
    view.delegateEvents();
  } else {
    // Not in cache, instantiate a new view and cache it.
    view = Backbone.ViewCache.set(new HomeView());
    view.render();
  }

  // (Re-)insert the view into the DOM.
}
```

```javascript
// Remove the current view from the cache.
Backbone.ViewCache.remove()

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

For retaining the scroll position and auto-clear expireds functionality, *Backbone.ViewCache* `beforeRoute` and `afterRoute` methods have to be called as pre- and post-route hooks. This can be done in your router’s `execute` method (added in Backbone v1.0.0).

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
  checkExpireds: undefined

});
```

## Methods added to Backbone.View.prototype

Backbone views are extended with three additional methods which are called internally and can also be called on demand: `saveScrollPosition`, `restoreScrollPosition`, and `setCacheExpiry`.

```javascript
// Expire the view in 5 minutes (takes precedence over global config).
homeView.setCacheExpiry(300);

// Save the view’s scroll position (while in the DOM).
homeView.saveScrollPosition();

// Restore the previously saved scroll position (while in the DOM).
homeView.restoreScrollPosition();
```

## Limitations

Due to a [known Android bug][android], restoring the view’s scroll position doesn’t work in the stock browser for Android 4.0.x (Ice Cream Sandwich) and lower.

[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[requirejs]: http://requirejs.org/
[browserify]: http://browserify.org/
[bower]: http://bower.io/
[android]: https://code.google.com/p/android/issues/detail?id=19625
