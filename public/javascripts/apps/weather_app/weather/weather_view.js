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
      this.renderGradient(); // immediate gradient render
      this.gradienter = setInterval( function() {
        self.renderGradient();
      }, 60000 );
      this.initialFadeIn();
      console.log( this );
    },

    onRender: function() {
      // this.updateTime(); // immediate time update (breaks onload)
    },

    initialFadeIn: function() {
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 2000 );
      }
    },

    renderGradient: function() {
      var s1, s2, s3,
        sunrise, sunset, currentTime,
        dayToSetP, dayToSetS, setToNightP, setToNightS, p, s;

      // Get times.
      sunrise     = this.model.get('sunrise').unix(),
      sunset      = this.model.get('sunset').unix(),
      currentTime = this.model.get('locationTime').unix();

      // Set colors.
      p = {
        day: 'rgb(97,155,215)',
        set: '#EC8648',
        night: 'rgb(54,81,180)'
      };
      s = {
        day: 'rgb(192,188,116)',
        set: '#FCEA84',
        night: 'rgb(10,25,52)'
      };

      // day -> sunset (primary)
      dayToSetP = new SVG.Color( p.day ).morph( p.set );
      // day -> sunset (secondary)
      dayToSetS = new SVG.Color( s.day ).morph( s.set );
      // sunset -> night (primary)
      setToNightP = new SVG.Color( p.set ).morph( p.night );
      // sunset -> night (secondary)
      setToNightS = new SVG.Color( s.set ).morph( s.night );

      // If the scene already has an SVG element, don't draw another one.
      if ( !window.draw ) {
        window.draw = SVG('super-container').size('100%', '100%');
      }

      // By default, gradient is at daytime.
      window.gradient = draw.gradient('radial', function(stop) {
        s1 = stop.at(0, dayToSetS.at(0));
        s3 = stop.at(1, dayToSetP.at(0));
      });

      // shift sunrise by 300 seconds.
      var sunriseDiff = currentTime - (sunrise - 300);
      // shift sunset by 600 seconds so that lighting is more realistic
      var sunsetDiff = (sunset - 600) - currentTime;


      if ( 0 <= sunsetDiff && sunsetDiff <= 3600 ) {
        // TRANSITION ( day -> sunset ) | 60 minutes
        // console.log('day transition into sunset'); // DEBUG
        sunsetDiff = Math.round( (sunsetDiff / 3600) * 100 ) / 100;
        s1.update( 0, dayToSetS.at( 1 - sunsetDiff ) );
        s3.update( 1, dayToSetP.at( 1 - sunsetDiff ) );

      } else if ( -1800 <= sunsetDiff && sunsetDiff < 0 ) {
        // TRANSITION ( sunset -> night ) | 30 minutes
        // console.log('sunset transition into night'); // DEBUG
        sunsetDiff = Math.abs( sunsetDiff );
        sunsetDiff = Math.round( (sunsetDiff / 1800) * 100 ) / 100;
        s1.update( 0, setToNightS.at( sunsetDiff ) );
        s3.update( 1, setToNightP.at( sunsetDiff ) );

      } else if ( -1800 <= sunriseDiff && sunriseDiff < 0 ) {
        // TRANSITION ( night -> sunrise ) | 30 minutes
        // console.log('night transition into sunrise'); // DEBUG
        sunriseDiff = Math.abs( sunriseDiff );
        sunriseDiff = Math.round( (sunriseDiff / 1800) * 100 ) / 100;
        s1.update( 0, setToNightS.at( sunriseDiff ) );
        s3.update( 1, setToNightP.at( sunriseDiff ) );

      } else if ( 0 <= sunriseDiff && sunriseDiff <= 3600 ) {
        // TRANSITION ( sunrise -> day ) | 60 minutes
        console.log('sunrise transition into day'); // DEBUG
        // sunriseDiff = Math.round( (sunriseDiff / 3600) * 100 ) / 100;
        s1.update( 0, dayToSetS.at( 1 - sunriseDiff ) );
        s3.update( 1, dayToSetP.at( 1 - sunriseDiff ) );

      } else if ( (sunrise < currentTime) && (currentTime < sunset) ) {
        // day
        // console.log('daytime'); // DEBUG
        s1.update( 0, dayToSetS.at(0) );
        s3.update( 1, dayToSetP.at(0) );

      } else {
        // night
        // console.log('nighttime'); // DEBUG
        s1.update( 0, setToNightS.at(1) );
        s3.update( 1, setToNightP.at(1) );
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

    remove: function() {
      clearInterval( this.timer );
      clearInterval( this.gradienter );
      return Marionette.ItemView.prototype.remove.call( this );
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
