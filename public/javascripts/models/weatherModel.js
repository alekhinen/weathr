var WeatherModel = Backbone.Model.extend({

  defaults: {
    lat: 0,
    lng: 0,
    weather: {
      'latitude': 0,
      'longitude': 0,
      'timezone': '',
      'offset': 0,
      'currently': {
        'time': 0,
        'summary': '',
        'icon': '',
        'nearestStormDistance': 0,
        'nearestStormBearing': 0,
        'precipIntensity': 0,
        'precipProbability': 0,
        'temperature': 0,
        'apparentTemperature': 0,
        'dewPoint': 0,
        'humidity': 0,
        'windSpeed': 0,
        'windBearing': 0,
        'visibility': 0,
        'cloudCover': 0,
        'pressure': 0,
        'ozone': 0
      },
      'minutely': {
        'summary': '',
        'icon': '',
        'data': [
          {
            'time': 0,
            'precipIntensity': 0,
            'precipProbability': 0
          }
        ]
      },
      'hourly': {
        'summary': '',
        'icon': '',
        'data': [
          {
            'time': 0,
            'summary': '',
            'icon': '',
            'precipIntensity': 0,
            'precipProbability': 0,
            'precipType': '',
            'temperature': 0,
            'apparentTemperature': 0,
            'dewPoint': 0,
            'humidity': 0,
            'windSpeed': 0,
            'windBearing': 0,
            'visibility': 0,
            'cloudCover': 0,
            'pressure': 0,
            'ozone': 0
          }
        ]
      },
      'daily': {
        'summary': '',
        'icon': '',
        'data': [
          {
            'time': 0,
            'summary': '',
            'icon': '',
            'sunriseTime': 0,
            'sunsetTime': 0,
            'moonPhase': 0,
            'precipIntensity': 0,
            'precipIntensityMax': 0,
            'precipIntensityMaxTime': 0,
            'precipProbability': 0,
            'precipType': '',
            'temperatureMin': 0,
            'temperatureMinTime': 0,
            'temperatureMax': 0,
            'temperatureMaxTime': 0,
            'apparentTemperatureMin': 0,
            'apparentTemperatureMinTime': 0,
            'apparentTemperatureMax': 0,
            'apparentTemperatureMaxTime': 0,
            'dewPoint': 0,
            'humidity': 0,
            'windSpeed': 0,
            'windBearing': 0,
            'visibility': 0,
            'cloudCover': 0,
            'pressure': 0,
            'ozone': 0
          }
        ]
      }
    }
  }

});
