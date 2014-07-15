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
      WeatherApp.Weather.Controller.showWeather(location);
    }
  };

  App.vent.on('submit:location', function( location ) {
    if ( location !== '' ) {
      Backbone.history.navigate('weather/location/' + location);
      API.weather( location );
    }
  });

  App.addInitializer( function() {
    new WeatherApp.Router({
      controller: API
    });
  });

});
