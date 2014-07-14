App.module('WeatherApp.Show', function (Show, App, Backbone, Marionette, $, _) {

  Show.Controller = {

    recentSearches: new App.Entities.RecentSearches(),

    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // Weather ----------------------------------------------------------------
    // Displays all the Views associated with the Weather.
    showWeather: function( location ) {
      var self = this;

      this.layout = this.getLayoutView();

      this.layout.on('show', function() {
        self.getWeather( location );
      });

      App.mainRegion.show( this.layout );
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

    // Gets and Sets the Weather Data.
    getWeatherFromCurrentPosition: function() {
      var self = this;

      // To deal with the async nature of this function, everything must be
      // placed inside this callback until promises gets added.
      navigator.geolocation.getCurrentPosition( function( pos ) {
        var lat       = pos.coords.latitude,
          lng         = pos.coords.longitude,
          geoLoc      = self.getLocationFromCoordinates( lat, lng ),
          weatherData = self.getWeatherData( geoLoc );

        if ( weatherData ) {
          self.getWeatherViews( 'current', geoLoc, weatherData );
        }
      });
    },

    // Gets and Sets the Weather Data.
    getWeatherFromLocation: function( location ) {
      var geoLoc    = this.getLocationFromLocation( location ),
        weatherData = this.getWeatherData( geoLoc );

      if ( weatherData ) {
        this.getWeatherViews( location, geoLoc, weatherData );
      }
    },

    getWeatherViews: function( location, geoLoc, weatherData ) {
      var recentSearchesView,
        dailyForecastsView,
        timesView,
        currentWeatherView,
        self = this;

      console.log( location, geoLoc, weatherData );

      // Update the controller's recentSearches.
      this.updateRecentSearches({
        locationURL: location,
        formattedLocation: geoLoc.formatted_address,
        current: true,
        geoLoc: geoLoc,
        weatherData: weatherData
      });

      // Create new instances of all the Views needed.
      recentSearchesView = new Show.RecentSearches({
        collection: self.recentSearches
      });
      dailyForecastsView = new Show.DailyForecasts({
        collection: new App.Entities.DailyForecasts( weatherData.daily.data )
      });
      timesView          = new Show.Times({
        model: new App.Entities.Times({
          timezone: weatherData.timezone,
          tzOffset: weatherData.offset,
          sunrise:  moment.unix( weatherData.daily.data[0].sunriseTime ),
          sunset:   moment.unix( weatherData.daily.data[0].sunsetTime ),
          locationTime: moment().zone( weatherData.offset * -1 )
        })
      });
      currentWeatherView = new Show.CurrentWeather({
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
      recentSearchesView.on( 'childview:submit:prevSearch', function(cV, s ) {
        // Not going to bubble this up to the weather_app.
        var l = s.attributes.locationURL,
          gL = s.attributes.geoLoc,
          wD = s.attributes.weatherData;
        Backbone.history.navigate('weather/location/' + l);
        self.getWeatherViews( l, gL, wD );

      });

      // Display the views in the controller's layout.
      this.layout.topLeftRegion.show( recentSearchesView );
      this.layout.topRightRegion.show( dailyForecastsView );
      this.layout.centerRegion.show( timesView );
      this.layout.bottomLeftRegion.show( currentWeatherView );
    },

    // Gets location data from server.
    getLocationFromCoordinates: function( lat, lng ) {
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
    },

    // Gets location data from a location (string)
    getLocationFromLocation: function( location ) {
      var result, geoData,
        self = this;

      $.ajax({
        url: '/geocode/location/' + location,
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

      // return statement must be outside success fn for AJAX to be !async.
      return result;
    },

    // Gets weather data from server.
    getWeatherData: function( geo ) {
      var lat   = geo.geometry.location.lat,
        lng     = geo.geometry.location.lng,
        ajaxURL = 'weather/lat/' + lat + '/lng/' + lng,
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
      return new Show.Layout();
    }

  };

});
