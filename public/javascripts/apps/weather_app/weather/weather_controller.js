App.module('WeatherApp.Weather',
  function (Weather, App, Backbone, Marionette, $, _) {

  // Settings
  Weather.hasInitiallyLoaded = false;

  // Controller
  Weather.Controller = {

    recentSearches: new App.Entities.RecentSearches(),

    // Displays all views associated with the Weather.
    showWeather: function( location ) {
      var self = this;

      this.layout = this.getLayoutView();

      this.layout.on('show', function() {
        self.getWeather( location );
      });

      App.mainRegion.show( this.layout );
      Weather.hasInitiallyLoaded = true;
    },

    // Requests server data to be passed into weather views.
    getWeather: function( location ) {
      var lat, lng, geoLoc, weatherData,
        self = this;

      if ( location === 'current' ) {
        // To deal with the async nature of this function, everything must be
        // placed inside this callback until promises gets added.
        navigator.geolocation.getCurrentPosition( function( pos ) {
          lat         = pos.coords.latitude,
          lng         = pos.coords.longitude,
          geoLoc      = Weather.Requests.getLocationFromCoords( lat, lng );
          if ( geoLoc ) {
            weatherData = Weather.Requests.getWeatherData( geoLoc );
          } if ( weatherData ) {
            self.getWeatherViews( 'current', geoLoc, weatherData );
          } else {
            this.createErrorView();
          }
        });

      } else {
        geoLoc = Weather.Requests.getLocationFromLocation( location );
        if ( geoLoc ) {
          weatherData = Weather.Requests.getWeatherData( geoLoc );
        } if ( weatherData ) {
          this.getWeatherViews( location, geoLoc, weatherData );
        } else {
          this.createErrorView();
        }
      }
    },

    // Create + display instances of all weather views + event listening
    getWeatherViews: function( location, geoLoc, weatherData ) {
      console.log( location, geoLoc, weatherData ); // DEBUG

      // update recentSearches
      this.updateRecentSearches({
        locationURL: location,
        formattedLocation: geoLoc.formatted_address,
        current: true,
        geoLoc: geoLoc,
        weatherData: weatherData
      });

      // view instances
      this.createWeatherViews( location, geoLoc, weatherData );

      // event listeners
      this.initEventListeners( location, geoLoc, weatherData );

      // render the view instances
      this.layout.topLeftRegion.show( this.recentSearchesView );
      this.layout.topRightRegion.show( this.forecastsLayout );
      this.layout.centerRegion.show( this.timesView );
      this.layout.bottomLeftRegion.show( this.currentWeatherView );
      this.forecastsLayout.fcRegion.show( this.dailyForecastsView );
    },

    // Creates instances of views specific to weather onto the collection.
    createWeatherViews: function( location, geoLoc, weatherData ) {
      this.createRecentSearchesView();
      this.createForecastsViews( weatherData, true );
      this.createTimesView( weatherData, geoLoc );
      this.createCurrentWeatherView( weatherData );
    },

    createRecentSearchesView: function() {
      var self = this;
      this.recentSearchesView = new Weather.RecentSearches({
        collection: self.recentSearches
      });
    },

    createForecastsViews: function( weatherData, createLayout ) {
      if ( createLayout ) {
        this.forecastsLayout = new Weather.ForecastsLayout();
      }
      this.dailyForecastsView = new Weather.DailyForecasts({
        collection: new App.Entities.DailyForecasts( weatherData.daily.data ),
        model: new App.Entities.TimelyForecast({
          icon: weatherData.daily.icon,
          summary: weatherData.daily.summary
        })
      });
      this.hourlyForecastsView = new Weather.HourlyForecasts({
        collection: new App.Entities.HourlyForecasts( weatherData.hourly.data ),
        model: new App.Entities.TimelyForecast({
          icon: weatherData.hourly.icon,
          summary: weatherData.hourly.summary
        })
      });
    },

    createTimesView: function( weatherData, geoLoc ) {
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

      this.timesView = new Weather.Times({
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

    createCurrentWeatherView: function( weatherData ) {
      this.currentWeatherView = new Weather.CurrentWeather({
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

    // Create the error view + event listening.
    createErrorView: function() {
      var self = this;
      this.createRecentSearchesView();
      this.errorView = new Weather.ErrorView();

      // TODO: should there be a separation of parts like getWeatherViews()?

      this.layout.topLeftRegion.show( this.recentSearchesView );
      this.layout.centerRegion.show( this.errorView );

      // event listeners
      this.recentSearchesView.on( 'weather:submit:location',
        function( location ) {
        App.vent.trigger( 'submit:location', location );
      });
      this.recentSearchesView.on( 'childview:submit:prevSearch',
        function( cV, s ) {
        // Not going to bubble this up to the weather_app.
        var l = s.attributes.locationURL,
          gL  = s.attributes.geoLoc,
          wD  = s.attributes.weatherData;
        Backbone.history.navigate( 'weather/location/' + l );
        self.getWeatherViews( l, gL, wD );
      });
    },

    // Initializes the event listeners for the weather views.
    initEventListeners: function( location, geoLoc, weatherData ) {
      var self = this;

      this.recentSearchesView.on( 'weather:submit:location',
        function( location ) {
        App.vent.trigger( 'submit:location', location );
      });
      this.recentSearchesView.on( 'childview:submit:prevSearch',
        function( cV, s ) {
        // Not going to bubble this up to the weather_app.
        var l = s.attributes.locationURL,
          gL  = s.attributes.geoLoc,
          wD  = s.attributes.weatherData;
        Backbone.history.navigate( 'weather/location/' + l );
        self.getWeatherViews( l, gL, wD );
      });
      this.forecastsLayout.on( 'forecasts:switch:weekly', function( v ) {
        self.createForecastsViews( weatherData, false );
        self.forecastsLayout.fcRegion.show( self.dailyForecastsView );
      });
      this.forecastsLayout.on( 'forecasts:switch:hourly', function( v ) {
        self.createForecastsViews( weatherData, false );
        self.forecastsLayout.fcRegion.show( self.hourlyForecastsView );
      });
    },

    // Updates the recentSearches collection with supplied object.
    updateRecentSearches: function( obj ) {
      // TODO: this will cause a memory leak. cap it at 10 models.
      var alreadyExists = false,
        i = 0,
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
    },

    getLayoutView: function() {
      return new Weather.Layout();
    }

  };

});
