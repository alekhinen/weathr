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
