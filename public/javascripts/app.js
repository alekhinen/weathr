(function( window ) {

  'use strict';

  window.App = new Backbone.Marionette.Application({
    recentSearches: new RecentSearches()
  });

  App.addInitializer( function ( options ) {
    var router = new Router();
    Backbone.history.start();
  });

})( this );
