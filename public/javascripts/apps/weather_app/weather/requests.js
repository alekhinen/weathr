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
  };

});
