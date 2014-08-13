App.module('WeatherApp.Show', function (Show, App, Backbone, Marionette, $, _) {

  // Layout View --------------------------------------------------------------
  Show.Layout = Marionette.LayoutView.extend({
    template: '#show-layout',

    regions: {
      topLeftRegion:     '#top-left',
      topRightRegion:    '#top-right',
      centerRegion:      '#center',
      bottomLeftRegion:  '#bottom-left',
      bottomRightRegion: '#bottom-right'
    }
  });

  // Index View ---------------------------------------------------------------
  Show.Index = Marionette.ItemView.extend({
    template: '#show-index',

    events: {
      'submit #index-location-search': 'submitLocation',
      'click #current-location': 'submitCurrentLocation'
    },

    initialize: function() {
      console.log( 'Initializing WeatherApp\'s index page.' );
      this.renderGradient();
      // $('body').on('mousemove', this.updateGradient);
    },

    renderGradient: function() {
      var s1, s2, s3;
      window.draw = SVG('super-container').size('100%', '100%');
      window.gradient = draw.gradient('radial', function(stop) {
        s1 = stop.at(0, '#a12f42');
        s2 = stop.at(0.4, '#872736');
        s3 = stop.at(1, '#1d1e65');
      });
      window.rect = draw.rect('200%', '200%').attr({
        fill: gradient
      });
    },

    updateGradient: function( e ) {
      var colors = App.WeatherApp.Colors.createMouseMovementGradient( e );

      window.gradient.update( function( stop ) {
        stop.at( 0, colors.secondary );
        stop.at( 1, colors.primary );
      });
    },

    submitLocation: function( e ) {
      e.preventDefault();
      var location = $('#location')[0].value.replace( /\s/g, '+' );
      this.trigger( 'index:submit:location', location );
    },

    submitCurrentLocation: function() {
      this.trigger( 'index:submit:location', 'current' );
    },

    remove: function() {
      $( 'body' ).off('mousemove', this.updateGradient);
      return Marionette.ItemView.prototype.remove.call( this );
    }
  });

});
