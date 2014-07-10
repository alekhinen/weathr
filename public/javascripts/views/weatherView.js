var WeatherView = Backbone.View.extend({

  // el: '#app',
  template: _.template($('#weather-view-template').html()),

  events: {
    'submit #index-location-search': 'submitLocation'
  },

  initialize: function() {
    console.log('initializing WeatherView');
    var address, geoLoc, weatherData,
      self = this;

    // Get the address from the model.
    address = this.model.attributes.address;

    // If the address is 'current', find location of client.
    if ( address === 'current' ) {
      // To deal with the async nature of this function, everything must be
      // placed inside this callback until promises gets added.
      navigator.geolocation.getCurrentPosition( function( pos ) {
        var lat, lng;
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        geoLoc = self.getLocFromCoords( lat, lng );
        weatherData = self.getWeatherData( geoLoc );

        if ( weatherData ) {
          self.render();
          self.timer = setInterval( self.updateTime, 1000 );
          console.log( self.model );
        }
      });
    }
    // else get the geolocation from the supplied address
    else {
      // GET the geolocation data
      geoLoc = this.getGeolocation( address );
      // GET the weather data
      weatherData = this.getWeatherData( geoLoc );

      if ( weatherData ) {
        this.render();
        this.timer = setInterval(self.updateTime, 1000);

        console.log( this.model );
      }
    }
  },

  getGeolocation: function( addy ) {
    var result, geoData,
      self = this;

    $.ajax({
      url: '/geocode/address/' + addy,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        // parse geocode data.
        geoData = JSON.parse( data );
        // set results
        result = {
          lat: geoData.results[0].geometry.location.lat,
          lng: geoData.results[0].geometry.location.lng
        };
        // set model
        self.model.set( geoData.results[0] );
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      }
    });

    // return statement must be outside success fn for AJAX to be !async.
    return result;
  },

  getLocFromCoords: function( lat, lng ) {
    var result, geoData,
      self = this;

      console.log( lat, lng );

    $.ajax({
      url: '/geocode/lat/' + lat + '/lng/' + lng,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        console.log( 'great success' );
        geoData = JSON.parse( data );
        console.log( geoData );
        // realistically, this could just be the supplied lat & lng.
        result = {
          lat: geoData.results[0].geometry.location.lat,
          lng: geoData.results[0].geometry.location.lng
        };
        self.model.set( geoData.results[0] );
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      }
    });

    return result;
  },

  getWeatherData: function( geo ) {
    var lat, lng, ajaxURL, self, result;

    lat     = geo.lat,
    lng     = geo.lng,
    ajaxURL = 'weather/lat/' + lat + '/lng/' + lng,
    self    = this;

    $.ajax({
      url: ajaxURL,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        self.model.set( data );
        result = true;
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
        result = false;
      }
    });

    return result;
  },

  render: function() {
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

    this.$el.html( this.template(this.model.toJSON()) );
  },

  updateTime: function() {
    var curTime = moment().local();
    var M = curTime.format('h:mm:ss');
    var m = curTime.format('A');
    $('.current-time')[0].innerHTML = M + '<span> ' + m + '</span>';
  },

  remove: function() {
    clearInterval( this.timer );
    return Backbone.View.prototype.remove.call( this );
  }

});
