App.module('WeatherApp.Show',
  function (Show, App, Backbone, Marionette, $, _) {

  // Settings
  Show.hasInitiallyLoaded = false;

  // Controller
  Show.Controller = {

    // Index ------------------------------------------------------------------
    // Displays the Index View.
    showIndex: function() {
      var self = this;

      this.layout = this.getLayoutView();

      this.layout.on('show', function() {
        self.getIndex();
      });

      App.mainRegion.show( this.layout );
    },

    // Gets the Index View and listens to events.
    getIndex: function() {
      var showIndex = new Show.Index();
      showIndex.on( 'index:submit:location', function( location ) {
        App.vent.trigger( 'submit:location', location );
      });
      this.layout.centerRegion.show( showIndex );
    },

    getLayoutView: function() {
      return new Show.Layout();
    }

  };

});
