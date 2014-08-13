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
      Backbone.history.start({
        pushState: true
      });
    }
  });

})( this );

App.module('Entities', function (Entities, App, Backbone, Marionette, $, _) {

  // Singleton recent search
  Entities.RecentSearch = Backbone.Model.extend({
    defaults: {
      locationURL: 'current',
      formattedLocation: ''
    }
  });

  // The recent searches collection
  Entities.RecentSearches = Backbone.Collection.extend({
    model: Entities.RecentSearch
  });

  // The forecast for a single day
  Entities.DailyForecast = Backbone.Model.extend({
    defaults: {
      sunriseTime: moment().startOf('day').add('h', 6),
      icon: 'clear-day',
      temperatureMax: 85,
      temperatureMin: 72
    }
  });

  // A collection of daily forecasts
  Entities.DailyForecasts = Backbone.Collection.extend({
    model: Entities.DailyForecast
  });

  // The forecast for a week/day
  Entities.TimelyForecast = Backbone.Model.extend({
    defaults: {
      icon: 'clear-day',
      summary: 'Clear'
    }
  });

  // The forecast for an hour
  Entities.HourlyForecast = Backbone.Model.extend({
    defaults: {
      icon: 'clear-day',
      summary: 'Clear',
      temperature: 72,
      time: moment().local(),
      tzOffset: -4
    }
  });

  // A collection of hourly forecasts
  Entities.HourlyForecasts = Backbone.Collection.extend({
    model: Entities.HourlyForecast
  });

  // The location and local time
  Entities.Times = Backbone.Model.extend({
    defaults: {
      timezone: 'America/New_York',
      tzOffset: -4,
      locationTime: moment().zone( 4 ),
      localTime: moment().local(),
      sunrise: moment().startOf('day').add('h', 6),
      sunset: moment().endOf('day').subtract('h', 3),
      location: 'New York'
    },

    // Updates locationTime and localTime to the current time.
    updateTime: function() {
      this.set( 'locationTime', moment().zone( this.get('tzOffset') * -1 ) );
      this.set( 'localTime', moment().local() );
    }
  });

  // The current weather
  Entities.CurrentWeather = Backbone.Model.extend({
    defaults: {
      high: 85,
      low: 72,
      temperature: 80,
      icon: 'clear-day',
      summary: 'Clear'
    }
  });

});

App.module('WeatherApp',
  function (WeatherApp, App, Backbone, Marionette, $, _) {

  WeatherApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      '': 'index',
      'weather/location/:location': 'weather'
    }
  });

  var API = {
    index: function() {
      WeatherApp.Show.Controller.showIndex();
    },
    weather: function( location ) {
      WeatherApp.Weather.Controller.initialize( location );
    }
  };

  App.vent.on('submit:location', function( location ) {
    if ( location !== '' ) {
      Backbone.history.navigate('/weather/location/' + location);
      API.weather( location );
    }
  });

  App.addInitializer( function() {
    new WeatherApp.Router({
      controller: API
    });
  });

});

App.module('WeatherApp.Colors',
  function (Colors, App, Backbone, Marionette, $, _) {

  // Gradients ----------------------------------------------------------------
  // colors used for the various gradients
  Colors.Gradients = {
    day: {
      prim: 'rgb(97,155,215)',
      secnd: 'rgb(192,188,116)'
    },
    sunset: {
      prim: 'rgb(236,134,72)',
      secnd: 'rgb(252,234,132)'
    },
    night: {
      prim: 'rgb(54,81,180)',
      secnd: 'rgb(10,25,52)'
    },
    sunrise: {
      prim: 'rgb(236,134,72)',
      secnd: 'rgb(252,234,132)'
    }
  };

  // createMouseMovementGradient() --------------------------------------------
  // creates a gradient based off of mouse movements.
  Colors.createMouseMovementGradient = function( e ) {
    var percX, percY, g, colors;

    g = Colors.Gradients;

    // Get a percentage value of where the mouse is.
    percX = Math.round( ( e.pageX / $(document).width() ) * 100 ) / 100;
    percY = Math.round( ( e.pageY / $(document).height() ) * 100 ) / 100;

    // Set the colors into an SVG.
    colors = {
      primary: new SVG.Color( g.day.prim ),
      secondary: new SVG.Color( g.day.secnd )
    };

    // Set colors based on mouse position of page.
    var dayToSetP = new SVG.Color( g.day.prim ).morph( g.sunset.prim );
    var dayToSetS = new SVG.Color( g.day.secnd ).morph( g.sunset.secnd );
    var setToNightP = new SVG.Color( g.sunset.prim ).morph( g.night.prim );
    var setToNightS = new SVG.Color( g.sunset.secnd ).morph( g.night.secnd );

    if ( percX <= 0.5 ) {
      percX = Math.round( (percX / 0.5) * 100 ) / 100;
      colors.primary = dayToSetP.at( percX );
    } else if ( percX > 0.5 ) {
      percX = Math.round( ( (percX - 0.5) / 0.5 ) * 100 ) / 100;
      colors.primary = setToNightP.at( percX );
    }

    if ( percY <= 0.5 ) {
      percY = Math.round( (percY / 0.5) * 100 ) / 100;
      colors.secondary = dayToSetS.at( percY );
    } else if ( percY > 0.5 ) {
      percY = Math.round( ( (percY - 0.5) / 0.5 ) * 100 ) / 100;
      colors.secondary = setToNightS.at( percY );
    }

    return colors;
  };

  // createTimeBasedGradient() ------------------------------------------------
  // creates a gradient based off of time of day.
  Colors.createTimeBasedGradient = function( cur, sunrise, sunset ) {
    var dayToSetP, dayToSetS, setToNightP, setToNightS, g, colors;

    g = Colors.Gradients;

    // create SVG colors that morph into each other
    // day -> sunset (primary)
    dayToSetP = new SVG.Color( g.day.prim ).morph( g.sunset.prim );
    // day -> sunset (secondary)
    dayToSetS = new SVG.Color( g.day.secnd ).morph( g.sunset.secnd );
    // sunset -> night (primary)
    setToNightP = new SVG.Color( g.sunset.prim ).morph( g.night.prim );
    // sunset -> night (secondary)
    setToNightS = new SVG.Color( g.sunset.secnd ).morph( g.night.secnd );

    // by default, gradient is at daytime.
    colors = {
      primary: dayToSetP.at( 0 ),
      secondary: dayToSetS.at( 0 )
    };

    // shift sunrise by 300 seconds (for realistic lighting)
    var sunriseDiff = cur - (sunrise - 300);
    // shift sunset by 600 seconds (for realistic lighting)
    var sunsetDiff = (sunset - 600) - cur;

    if ( 0 <= sunsetDiff && sunsetDiff <= 3600 ) {
      // TRANSITION ( day -> sunset ) | 60 minutes
      // diff increments as time goes on.
      sunsetDiff = Math.round( (sunsetDiff / 3600) * 100 ) / 100;
      colors.primary   = dayToSetP.at( 1 - sunsetDiff );
      colors.secondary = dayToSetS.at( 1 - sunsetDiff );

    } else if ( -1800 <= sunsetDiff && sunsetDiff < 0 ) {
      // TRANSITION ( sunset -> night ) | 30 minutes
      // diff increments as time goes on.
      sunsetDiff = Math.abs( sunsetDiff );
      sunsetDiff = Math.round( (sunsetDiff / 1800) * 100 ) / 100;
      colors.primary   = setToNightP.at( sunsetDiff );
      colors.secondary = setToNightS.at( sunsetDiff );

    } else if ( -1800 <= sunriseDiff && sunriseDiff < 0 ) {
      // TRANSITION ( night -> sunrise ) | 30 minutes
      // diff decrements as time goes on.
      sunriseDiff = Math.abs( sunriseDiff );
      sunriseDiff = Math.round( (sunriseDiff / 1800) * 100 ) / 100;
      colors.primary   = setToNightP.at( sunriseDiff );
      colors.secondary = setToNightS.at( sunriseDiff );

    } else if ( 0 <= sunriseDiff && sunriseDiff <= 3600 ) {
      // TRANSITION ( sunrise -> day ) | 60 minutes
      // diff increments as time goes on.
      sunriseDiff = Math.round( (sunriseDiff / 3600) * 100 ) / 100;
      colors.primary   = dayToSetP.at( 1 - sunriseDiff );
      colors.secondary = dayToSetS.at( 1 - sunriseDiff );


    } else if ( (sunrise < cur) && (cur < sunset) ) {
      // daytime
      colors.primary   = dayToSetP.at(0);
      colors.secondary = dayToSetS.at(0);

    } else {
      // nighttime
      colors.primary   = setToNightP.at(1);
      colors.secondary = setToNightS.at(1);

    }

    return colors;
  };

});

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

App.module('WeatherApp.Show',
  function (Show, App, Backbone, Marionette, $, _) {

  // Settings
  Show.hasInitiallyLoaded = false;

  // Controller
  Show.Controller = {

    // Index ------------------------------------------------------------------
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

App.module('WeatherApp.Weather.Requests',
  function (Requests, App, Backbone, Marionette, $, _) {

  'use strict';

  // --------------------------------------------------------------------------
  // Handles all requests (GET, POST, PUT, DELETE) to server for the weather
  // controller.
  // --------------------------------------------------------------------------

  // GET location data from server
  Requests.getLocationFromCoords = function( lat, lng ) {
    var result, geoData,
      self = this;

    $.ajax({
      url: '/geocode/lat/' + lat + '/lng/' + lng,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        result = JSON.parse( data ).results[0];
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
        result = false;
      }
    });

    return result;
  };

  // GET location data from a location (string)
  Requests.getLocationFromLocation = function( location ) {
    var result, geoData,
      self = this;

    $.ajax({
      url: '/geocode/location/' + location,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        result = JSON.parse( data ).results[0];
        if ( !result ) {
          result = false;
        }
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
        result = false;
      }
    });

    // return statement must be outside success fn for AJAX to be !async.
    return result;
  };

  // GET weather data from server.
  Requests.getWeatherData = function( geo ) {
    var lat   = geo.geometry.location.lat,
      lng     = geo.geometry.location.lng,
      ajaxURL = '/weather/lat/' + lat + '/lng/' + lng,
      self    = this,
      result;

    $.ajax({
      url: ajaxURL,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        result = data;
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
        result = false;
      }
    });

    return result;
  };

});

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

      this.model.updateTime();
      this.timer = setInterval( function() {
        self.model.updateTime();
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
      var awc         = App.WeatherApp.Colors;
      var sunrise     = this.model.get('sunrise').unix();
      var sunset      = this.model.get('sunset').unix();
      var currentTime = this.model.get('locationTime').unix();

      var colors = awc.createTimeBasedGradient( currentTime, sunrise, sunset );

      // if the scene already has an SVG element, don't draw another one.
      if ( !window.draw ) {
        window.draw = SVG('super-container').size('100%', '100%');
      }

      if ( !window.gradient ) {
        window.gradient = draw.gradient( 'radial', function( stop ) {
          stop.at( 0, colors.secondary );
          stop.at( 1, colors.primary );
        });
      } else {
        window.gradient.update( function( stop ) {
          stop.at( 0, colors.secondary );
          stop.at( 1, colors.primary );
        });
      }

      if ( window.rect ) {
        window.rect.fill( window.gradient );
      } else {
        window.rect = draw.rect('200%', '200%').attr({
          fill: window.gradient
        });
      }
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

App.module('WeatherApp.Weather',
  function(Weather, App, Backbone, Marionette, $, _) {

  'use strict';

  // --------------------------------------------------------------------------
  // Handles the creation of instances of all weather views.
  // --------------------------------------------------------------------------

  Weather.Creator = {

    // Layout -----------------------------------------------------------------
    newLayoutView: function() {
      return new Weather.Layout();
    },

    // RecentSearches ---------------------------------------------------------
    newRecentSearchesView: function( rs ) {
      return new Weather.RecentSearches({
        collection: rs
      });
    },

    // ForecastsLayout --------------------------------------------------------
    newForecastsLayout: function() {
      return new Weather.ForecastsLayout();
    },

    // DailyForecasts ---------------------------------------------------------
    newDailyForecastsView: function( weatherData ) {
      return new Weather.DailyForecasts({
        collection: new App.Entities.DailyForecasts( weatherData.daily.data ),
        model: new App.Entities.TimelyForecast({
          icon: weatherData.daily.icon,
          summary: weatherData.daily.summary
        })
      });
    },

    // HourlyForecasts --------------------------------------------------------
    newHourlyForecastsView: function( weatherData ) {
      var i = 0;
      var wdLen = weatherData.hourly.data.length;

      // Set the tzOffset for each hourly data.
      for ( ; i < wdLen; i++ ) {
        weatherData.hourly.data[ i ].tzOffset = weatherData.offset * -1;
      }

      return new Weather.HourlyForecasts({
        collection: new App.Entities.HourlyForecasts( weatherData.hourly.data ),
        model: new App.Entities.TimelyForecast({
          icon: weatherData.hourly.icon,
          summary: weatherData.hourly.summary
        })
      });
    },

    // Times ------------------------------------------------------------------
    newTimesView: function( weatherData, geoLoc ) {
      var loc;
      _.each( geoLoc.address_components, function( a ) {
        _.each( a.types, function( t ) {
          if ( t === 'locality' ) {
            loc = a.long_name;
          }
        });
      });
      // if the locality was never found, set loc to the formatted address.
      if ( !loc ) {
        loc = geoLoc.formatted_address;
      }

      return new Weather.Times({
        model: new App.Entities.Times({
          timezone: weatherData.timezone,
          tzOffset: weatherData.offset,
          sunrise:  moment.unix( weatherData.daily.data[0].sunriseTime ),
          sunset:   moment.unix( weatherData.daily.data[0].sunsetTime ),
          locationTime: moment().zone( weatherData.offset * -1 ),
          location: loc
        })
      });
    },

    // CurrentWeather ---------------------------------------------------------
    newCurrentWeatherView: function( weatherData ) {
      return new Weather.CurrentWeather({
        model: new App.Entities.CurrentWeather({
          temperature: weatherData.currently.temperature,
          feelsLike:   weatherData.currently.apparentTemperature,
          icon:        weatherData.currently.icon,
          summary:     weatherData.currently.summary,
          high:        weatherData.daily.data[0].temperatureMax,
          low:         weatherData.daily.data[0].temperatureMin
        })
      });
    },

    // Error ------------------------------------------------------------------
    newErrorView: function() {
      return new Weather.ErrorView();
    }

  };

});

App.module('WeatherApp.Weather',
  function (Weather, App, Backbone, Marionette, $, _) {

  // Settings
  Weather.hasInitiallyLoaded = false;

  // Controller
  Weather.Controller = {

    recentSearches: new App.Entities.RecentSearches(),

    // Initialize -------------------------------------------------------------
    // parse location, then show correct views.
    initialize: function( location ) {
      var lat, lng, geoLoc, weatherData, self;
      self = this;

      if ( location === 'current' ) {
        // To deal with the async nature of this function, everything must be
        // placed inside this callback until promises gets added.
        navigator.geolocation.getCurrentPosition( function( pos ) {
          lat    = pos.coords.latitude,
          lng    = pos.coords.longitude,
          geoLoc = Weather.Requests.getLocationFromCoords( lat, lng );
          if ( geoLoc ) {
            weatherData = Weather.Requests.getWeatherData( geoLoc );
          } if ( weatherData ) {
            self.showWeather( 'current', geoLoc, weatherData );
          } else {
            self.showError();
          }
        });
      } else {
        geoLoc = Weather.Requests.getLocationFromLocation( location );
        if ( geoLoc ) {
          weatherData = Weather.Requests.getWeatherData( geoLoc );
        } if ( weatherData ) {
          this.showWeather( location, geoLoc, weatherData );
        } else {
          self.showError();
        }
      }
    },

    // Weather ----------------------------------------------------------------
    // Displays all views associated with the Weather.
    showWeather: function( location, geoLoc, weatherData ) {
      var self, layout, recentSearchesV, forecastsL, dailyForecastsV, timesV,
        currentWeatherV, l, gL, wD, hourlyForecastsV, wc;
      self = this;
      wc   = Weather.Creator;

      // update recentSearches
      this.updateRecentSearches({
        locationURL: location,
        formattedLocation: geoLoc.formatted_address,
        current: true,
        geoLoc: geoLoc,
        weatherData: weatherData
      });

      // layout instance
      layout = wc.newLayoutView();

      // view instances
      recentSearchesV = wc.newRecentSearchesView( this.recentSearches );
      forecastsL      = wc.newForecastsLayout();
      dailyForecastsV = wc.newDailyForecastsView( weatherData );
      timesV          = wc.newTimesView( weatherData, geoLoc );
      currentWeatherV = wc.newCurrentWeatherView( weatherData );

      // render view instances
      layout.on('show', function() {
        layout.topLeftRegion.show( recentSearchesV );
        layout.topRightRegion.show( forecastsL );
        forecastsL.fcRegion.show( dailyForecastsV );
        layout.centerRegion.show( timesV );
        layout.bottomLeftRegion.show( currentWeatherV );
      });

      // event listeners
      recentSearchesV.on( 'weather:submit:location',
        function( location ) {
        App.vent.trigger( 'submit:location', location );
      });
      recentSearchesV.on( 'childview:submit:prevSearch',
        function( cV, s ) {
        // Not going to bubble this up to the weather_app.
        l  = s.attributes.locationURL;
        gL = s.attributes.geoLoc;
        wD = s.attributes.weatherData;
        Backbone.history.navigate( '/weather/location/' + l );
        self.showWeather( l, gL, wD );
      });
      forecastsL.on( 'forecasts:switch:weekly', function( v ) {
        dailyForecastsV = wc.newDailyForecastsView( weatherData );
        forecastsL.fcRegion.show( dailyForecastsV );
      });
      forecastsL.on( 'forecasts:switch:hourly', function( v ) {
        hourlyForecastsV = wc.newHourlyForecastsView( weatherData );
        console.log( hourlyForecastsV );
        forecastsL.fcRegion.show( hourlyForecastsV );
      });

      // render layout instance
      App.mainRegion.show( layout );
      Weather.hasInitiallyLoaded = true;
    },

    // Error ------------------------------------------------------------------
    showError: function() {
      var l, gL, wD, rsView, errorView, layout, self;
      self = this;

      // layout instance
      layout = Weather.Creator.newLayoutView();

      // view instances
      rsView = Weather.Creator.newRecentSearchesView( this.recentSearches );
      errorView = Weather.Creator.newErrorView();

      // render view instances
      layout.on( 'show', function() {
        layout.topLeftRegion.show( rsView );
        layout.centerRegion.show( errorView );
      });

      // event listeners
      rsView.on( 'weather:submit:location',
        function( location ) {
        App.vent.trigger( 'submit:location', location );
      });
      rsView.on( 'childview:submit:prevSearch', function( cV, s ) {
        // Not going to bubble this up to the weather_app.
        l  = s.attributes.locationURL;
        gL = s.attributes.geoLoc;
        wD = s.attributes.weatherData;
        Backbone.history.navigate( '/weather/location/' + l );
        self.showWeather( l, gL, wD );
      });

      // render layout instance
      App.mainRegion.show( layout );
      Weather.hasInitiallyLoaded = true;
    },


    // Updates the recentSearches collection with supplied object.
    updateRecentSearches: function( obj ) {
      var alreadyExists, i, self;

      alreadyExists = false;
      i = 0;
      self = this;

      this.recentSearches.each( function ( model ) {
        model.set( 'current', false );
        if ( model.get('locationURL') === obj.locationURL ) {
          model.set( 'current', true );
          alreadyExists = true;
        }
      });

      if ( !alreadyExists ) {
        this.recentSearches.unshift( new App.Entities.RecentSearch( obj ) );
      }

      // If the col is greater than 5 models, remove the last models.
      this.recentSearches.each( function( model ) {
        if ( i > 4 ) {
          self.recentSearches.remove( model );
        }
        i++;
      });
    }

  };

});
