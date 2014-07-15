App.module('WeatherApp.Weather',
  function (Weather, App, Backbone, Marionette, $, _) {

  // Settings
  Weather.hasInitiallyLoaded = false;

  // Controller
  Weather.Controller = {

    recentSearches: new App.Entities.RecentSearches(),

    // Displays all the Views associated with the Weather.
    showWeather: function( location ) {
      var self = this;

      this.layout = this.getLayoutView();

      this.layout.on('show', function() {
        self.getWeather( location );
      });

      App.mainRegion.show( this.layout );
      Weather.hasInitiallyLoaded = true;
    },

    // Gets the Weather Views and listens to events.
    getWeather: function( location ) {
      var self = this;

      if ( location === 'current' ) {
        this.getWeatherFromCurrentPosition();
      } else {
        this.getWeatherFromLocation( location );
      }

    },

    // Gets and sets the weather data from current position.
    getWeatherFromCurrentPosition: function() {
      var self = this;

      // To deal with the async nature of this function, everything must be
      // placed inside this callback until promises gets added.
      navigator.geolocation.getCurrentPosition( function( pos ) {
        var lat       = pos.coords.latitude,
          lng         = pos.coords.longitude,
          geoLoc      = Weather.Requests.getLocationFromCoords( lat, lng ),
          weatherData = Weather.Requests.getWeatherData( geoLoc );

        if ( weatherData ) {
          self.getWeatherViews( 'current', geoLoc, weatherData );
        }
      });
    },

    // Gets and sets the weather data from the supplied location.
    getWeatherFromLocation: function( location ) {
      var geoLoc    = Weather.Requests.getLocationFromLocation( location ),
        weatherData = Weather.Requests.getWeatherData( geoLoc );

      if ( weatherData ) {
        this.getWeatherViews( location, geoLoc, weatherData );
      }
    },

    // Creates new instances of all weather views, displays all views,
    // and listens to events from the views.
    getWeatherViews: function( location, geoLoc, weatherData ) {
      var recentSearchesView, dailyForecastsView, timesView,
        currentWeatherView,
        self = this;

      console.log( location, geoLoc, weatherData ); // DEBUG

      // Update the controller's recentSearches.
      this.updateRecentSearches({
        locationURL: location,
        formattedLocation: geoLoc.formatted_address,
        current: true,
        geoLoc: geoLoc,
        weatherData: weatherData
      });

      // Create new instances of all the Views needed.
      recentSearchesView = new Weather.RecentSearches({
        collection: self.recentSearches
      });
      dailyForecastsView = new Weather.DailyForecasts({
        collection: new App.Entities.DailyForecasts( weatherData.daily.data ),
        model: new App.Entities.WeeklyForecast({
          icon: weatherData.daily.icon,
          summary: weatherData.daily.summary
        })
      });
      timesView = new Weather.Times({
        model: new App.Entities.Times({
          timezone: weatherData.timezone,
          tzOffset: weatherData.offset,
          sunrise:  moment.unix( weatherData.daily.data[0].sunriseTime ),
          sunset:   moment.unix( weatherData.daily.data[0].sunsetTime ),
          locationTime: moment().zone( weatherData.offset * -1 )
        })
      });
      currentWeatherView = new Weather.CurrentWeather({
        model: new App.Entities.CurrentWeather({
          temperature: weatherData.currently.temperature,
          feelsLike:   weatherData.currently.apparentTemperature,
          icon:        weatherData.currently.icon,
          summary:     weatherData.currently.summary,
          high:        weatherData.daily.data[0].temperatureMax,
          low:         weatherData.daily.data[0].temperatureMin
        })
      });

      // event listeners
      recentSearchesView.on( 'weather:submit:location', function( location ) {
        App.vent.trigger( 'submit:location', location );
      });
      recentSearchesView.on( 'childview:submit:prevSearch', function( cV, s ) {
        // Not going to bubble this up to the weather_app.
        var l = s.attributes.locationURL,
          gL  = s.attributes.geoLoc,
          wD  = s.attributes.weatherData;
        Backbone.history.navigate( 'weather/location/' + l );
        self.getWeatherViews( l, gL, wD );

      });

      // Display the views in the controller's layout.
      this.layout.topLeftRegion.show( recentSearchesView );
      this.layout.topRightRegion.show( dailyForecastsView );
      this.layout.centerRegion.show( timesView );
      this.layout.bottomLeftRegion.show( currentWeatherView );
    },

    // Updates the recentSearches collection with supplied object.
    updateRecentSearches: function( obj ) {
      // TODO: this will cause a memory leak. cap it at 10 models.
      var alreadyExists = false;

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
    },

    getLayoutView: function() {
      return new Weather.Layout();
    }

  };

});
