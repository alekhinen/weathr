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
      this.initGraph( $( this.$el ).children()[ 1 ] );
    },

    initGraph: function( ctx ) {
      var timeLabel = [], highs = [], lows = [], mTime, mHigh, mLow;

      this.collection.each( function( model ) {
        mTime = model.get('sunriseTime');
        mHigh = Math.round( model.get('temperatureMax') );
        mLow  = Math.round( model.get('temperatureMin') );
        mTime = moment.unix( mTime ).format('dddd');

        timeLabel.push( mTime );
        highs.push( mHigh );
        lows.push( mLow );
      });

      var data = {
        labels: timeLabel,
        datasets: [
          {
            label: 'Daily High',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: highs
          },
          {
            label: 'Daily Low',
            fillColor: 'rgba(85,155,186,0.2)',
            strokeColor: 'rgba(85,155,186,1)',
            pointColor: 'rgba(85,155,186,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(85,155,186,1)',
            data: lows
          }
        ]
      };

      ctx = $( ctx ).get(0).getContext('2d');
      var hourlyChart = new Chart(ctx).Line( data );
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
      this.initGraph( $( this.$el ).children()[ 1 ] );
    },

    initGraph: function( ctx ) {
      var timeLabel = [], tempData = [], i = 0, mTime, mTz, mTemp;

      this.collection.each( function( model ) {
        if ( i <= 12 ) {
          mTime = model.get('time');
          mTz   = model.get('tzOffset');
          mTemp = model.get('temperature');
          mTime = moment.unix( mTime ).zone( mTz ).format('h:mm a');

          timeLabel.push( mTime );
          tempData.push( mTemp );
          i++;
        }
      });

      var data = {
        labels: timeLabel,
        datasets: [
          {
            label: 'My First dataset',
            fillColor: 'rgba(220,220,220,0.2)',
            strokeColor: 'rgba(220,220,220,1)',
            pointColor: 'rgba(220,220,220,1)',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: tempData
          }
        ]
      };

      ctx = $( ctx ).get(0).getContext('2d');
      var hourlyChart = new Chart(ctx).Line( data );
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
      this.gradienter = setInterval( function() {
        self.renderGradient();
      }, 60000 );
      this.initialFadeIn();
      console.log( this );
    },

    initialFadeIn: function() {
      if ( !Weather.hasInitiallyLoaded ) {
        this.$el.fadeOut( 0 );
        this.$el.fadeIn( 2000 );
      }
    },

    renderGradient: function() {
      var sunrise, sunset, currentTime;
      // Get times.
      sunrise     = this.model.get('sunrise').unix(),
      sunset      = this.model.get('sunset').unix(),
      currentTime = this.model.get('locationTime').unix();

      Weather.createResponsiveGradient( currentTime, sunrise, sunset );
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
