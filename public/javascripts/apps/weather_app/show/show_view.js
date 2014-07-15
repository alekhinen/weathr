App.module('WeatherApp.Show', function (Show, App, Backbone, Marionette, $, _) {

  // --------------------------------------------------------------------------
  // Layout View --------------------------------------------------------------
  Show.Layout = Marionette.LayoutView.extend({
    template: '#weather-show-layout',

    regions: {
      topLeftRegion:     '#top-left',
      topRightRegion:    '#top-right',
      centerRegion:      '#center',
      bottomLeftRegion:  '#bottom-left',
      bottomRightRegion: '#bottom-right'
    }

  });

  // --------------------------------------------------------------------------
  // Index View ---------------------------------------------------------------
  Show.Index = Marionette.ItemView.extend({
    template: '#weather-show-index',

    events: {
      'submit #index-location-search': 'submitLocation',
      'click #current-location': 'submitCurrentLocation'
    },

    initialize: function() {
      console.log( 'Initializing WeatherApp\'s index page.' );
      this.renderGradient();
      $('body').on('mousemove', this.updateGradient);
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
      var pWidth, pHeight, mX, mY, percX, percY,
        red, green, blue, max, col, col2;

      max = 255,
      pWidth = $(document).width(),
      pHeight = $(document).height(),
      mX = e.pageX,
      mY = e.pageY,
      percX = Math.round( ((mX / pWidth) * 100) ),
      percY = Math.round( ((mY / pHeight) * 100) );

      red = Math.round(percX * 1.5),
      green = Math.round(percY * 1.5);
      blue = max - Math.round( ( (red + green) / 510 ) * 100 ) - 50;

      col = new SVG.Color({ r: red, g: green, b: blue });
      col2 = new SVG.Color({ r: 255, g: red, b: green });

      gradient.update(function(stop) {
        s1 = stop.at(0, col2);
        s3 = stop.at(1, col);
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

  // --------------------------------------------------------------------------
  // Weather View(s) ----------------------------------------------------------
  Show.RecentSearch = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#weather-show-recent-search',

    events: {
      'click a': 'goToPreviousSearch'
    },

    goToPreviousSearch: function( e ) {
      this.trigger( 'submit:prevSearch', this.model );
    }

  });

  Show.RecentSearches = Marionette.CompositeView.extend({
    id: 'recent-searches',
    template: '#weather-show-recent-searches',
    childView: Show.RecentSearch,
    childViewContainer: '#recent-searches-list',

    events: {
      'submit #location-search': 'submitLocation'
    },

    submitLocation: function( e ) {
      e.preventDefault();
      var location = $('#location')[0].value.replace( /\s/g, '+' );
      this.trigger( 'weather:submit:location', location );
    },

    onRender: function() {
      if ( !Show.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }

  });

  // The forecast for a single day (singleton for DailyForecasts)
  Show.DailyForecast = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#weather-show-daily-forecast',

    events: {
      'click .daily-container': 'toggleMoreInfo'
    },

    toggleMoreInfo: function( e ) {
      $( e.currentTarget.parentElement ).toggleClass('active');
      $( e.currentTarget.lastElementChild ).toggle(500);
    }

  });

  // The forecast for a week
  Show.DailyForecasts = Marionette.CompositeView.extend({
    id: 'daily-forecasts',
    template: '#weather-show-daily-forecasts',
    childView: Show.DailyForecast,
    childViewContainer: '#daily-forecast-list',

    onRender: function() {
      if ( !Show.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }

  });

  // Displays the location's time and local time.
  Show.Times = Marionette.ItemView.extend({
    id: 'times',
    template: '#weather-show-times',

    modelEvents: {
      'change': 'render'
    },

    events: {
      'click .ion-refresh': 'refreshModel',
      'click .ion-arrow-down-c': 'incrementTime'
    },

    initialize: function() {
      var self = this;

      this.timer = setInterval( function() {
        self.updateTime( self.model.toJSON() );
      }, 1000 );
      this.renderGradient();
      this.initialFadeIn();
    },

    initialFadeIn: function() {
      if ( !Show.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 2000 );
      }
    },

    renderGradient: function() {
      var s1, s2, s3, sunrise, sunset, currentTime, dayTime, nightTime;

      sunrise     = this.model.get('sunrise').unix(),
      sunset      = this.model.get('sunset').unix(),
      currentTime = this.model.get('locationTime').unix();

      dayTime = {
        primary: new SVG.Color('rgb(97,155,215)'),
        secondary: new SVG.Color('rgb(192,188,116)')
      },
      nightTime = {
        primary: new SVG.Color('rgb(54,81,180)'),
        secondary: new SVG.Color('rgb(10,25,52)')
      };

      window.draw = SVG('super-container').size('100%', '100%');

      if ( (sunrise < currentTime) && (currentTime < sunset) ) {
        window.gradient = draw.gradient('radial', function(stop) {
          s1 = stop.at(0, dayTime.secondary);
          s3 = stop.at(1, dayTime.primary);
        });
      } else {
        window.gradient = draw.gradient('radial', function(stop) {
          s1 = stop.at(0, nightTime.seconday);
          s3 = stop.at(1, nightTime.primary);
        });
      }

      if ( window.rect ) {
        window.rect.fill( gradient );
      } else {
        window.rect = draw.rect('200%', '200%').attr({
          fill: gradient
        });
      }
    },

    updateTime: function( obj ) {
      this.model.set('locationTime', moment().zone( obj.tzOffset * -1 ) );
      this.model.set('localTime', moment().local() );
    },

    refreshModel: function() {
      console.log('refreshing model...');
    },

    incrementTime: function() {
      console.log('incrementing time...');
    }

  });

  // Displays the current weather
  Show.CurrentWeather = Marionette.ItemView.extend({
    template: '#weather-show-current-weather',
    id: 'current-weather',

    onRender: function() {
      if ( !Show.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }

  });

});
