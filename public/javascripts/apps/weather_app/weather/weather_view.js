App.module('WeatherApp.Weather',
  function (Weather, App, Backbone, Marionette, $, _) {

  // Layout -------------------------------------------------------------------
  Weather.Layout = Marionette.LayoutView.extend({
    template: '#weather-layout',

    regions: {
      topLeftRegion:     '#top-left',
      topRightRegion:    '#top-right',
      centerRegion:      '#center',
      bottomLeftRegion:  '#bottom-left',
      bottomRightRegion: '#bottom-right'
    }
  });

  // RecentSearch -------------------------------------------------------------
  Weather.RecentSearch = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#weather-recent-search',

    events: {
      'click a': 'goToPreviousSearch'
    },

    goToPreviousSearch: function( e ) {
      this.trigger( 'submit:prevSearch', this.model );
    }
  });

  // RecentSearches -----------------------------------------------------------
  Weather.RecentSearches = Marionette.CompositeView.extend({
    id: 'recent-searches',
    template: '#weather-recent-searches',
    childView: Weather.RecentSearch,
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
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }
  });

  // Forecasts (Layout) -------------------------------------------------------
  Weather.ForecastsLayout = Marionette.LayoutView.extend({
    id: 'forecasts-layout',
    template: '#weather-forecasts-layout',

    regions: {
      fcRegion: '#forecasts-container'
    },

    events: {
      'click #weekly-forecast-btn': 'switchToWeekly',
      'click #hourly-forecast-btn': 'switchToHourly'
    },

    switchToWeekly: function( e ) {
      $( e.currentTarget ).toggleClass( 'current' );
      $( '#hourly-forecast-btn' ).toggleClass( 'current' );
      this.trigger( 'forecasts:switch:weekly' );
    },

    switchToHourly: function( e ) {
      $( e.currentTarget ).toggleClass( 'current' );
      $( '#weekly-forecast-btn' ).toggleClass( 'current' );
      this.trigger( 'forecasts:switch:hourly' );
    }
  });

  // DailyForecast ------------------------------------------------------------
  Weather.DailyForecast = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#weather-daily-forecast',

    events: {
      'click .daily-container': 'toggleMoreInfo'
    },

    toggleMoreInfo: function( e ) {
      $( e.currentTarget.parentElement ).toggleClass('active');
      $( e.currentTarget.lastElementChild ).toggle(500);
    },

    onRender: function() {
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }
  });

  // DailyForecasts -----------------------------------------------------------
  Weather.DailyForecasts = Marionette.CompositeView.extend({
    id: 'daily-forecasts',
    template: '#weather-daily-forecasts',
    childView: Weather.DailyForecast,
    childViewContainer: '#daily-forecast-list',

    onRender: function() {
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }
  });

  // HourlyForecast -----------------------------------------------------------
  Weather.HourlyForecast = Marionette.ItemView.extend({
    tagName: 'li',
    template: '#weather-hourly-forecast'
  });

  // HourlyForecasts ----------------------------------------------------------
  Weather.HourlyForecasts = Marionette.CompositeView.extend({
    id: 'hourly-forecasts',
    template: '#weather-hourly-forecasts',
    childView: Weather.HourlyForecast,
    childViewContainer: '#hourly-forecast-list',

    onRender: function() {
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }
  });

  // Times --------------------------------------------------------------------
  Weather.Times = Marionette.ItemView.extend({
    id: 'times',
    template: '#weather-times',

    modelEvents: {
      'change': 'render'
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
      if ( !Weather.hasInitiallyLoaded ) {
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
    }
  });

  // CurrentWeather -----------------------------------------------------------
  Weather.CurrentWeather = Marionette.ItemView.extend({
    template: '#weather-current-weather',
    id: 'current-weather',

    onRender: function() {
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 1000 );
      }
    }
  });

  // Error --------------------------------------------------------------------
  Weather.ErrorView = Marionette.ItemView.extend({
    id: 'error',
    template: '#weather-error'
  });

});
