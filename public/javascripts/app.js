(function( window ) {

  'use strict';

  // Initialize a new Marionette App.
  window.App = new Backbone.Marionette.Application();

  // Set the regions.
  App.addRegions({
    mainRegion: '#app'
  });

  // Once the App starts, start listening to route changes.
  App.on('start', function ( options ) {
    if ( Backbone.history ) {
      Backbone.history.start();
    }
  });

})( this );
