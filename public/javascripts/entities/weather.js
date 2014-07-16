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

  Entities.HourlyForecast = Backbone.Model.extend({
    defaults: {
      icon: 'clear-day',
      summary: 'Clear',
      temperature: 72,
      time: moment().local()
    }
  });

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
