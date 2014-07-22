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
        Backbone.history.navigate( 'weather/location/' + l );
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
        Backbone.history.navigate( 'weather/location/' + l );
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
