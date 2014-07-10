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

    address = this.model.attributes.address;
    // GET the geolocation data
    geoLoc = this.getGeolocation( address );
    // GET the weather data
    weatherData = this.getWeatherData( geoLoc );

    if ( weatherData ) {
      this.render();
      this.timer = setInterval(self.updateTime, 1000);
    }

  },

  getGeolocation: function( addy ) {
    var result;

    $.ajax({
      url: '/geocode/address/' + addy,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        result = data;
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      }
    });
    // return statement must be outside success fn for AJAX to be !async.
    return result;
  },

  getWeatherData: function( geo ) {
    var lat, lng, ajaxURL, self, result;

    geo     = JSON.parse( geo );
    lat     = geo.results[0].geometry.location.lat,
    lng     = geo.results[0].geometry.location.lng,
    ajaxURL = 'weather/lat/' + lat + '/lng/' + lng,
    self    = this;

    $.ajax({
      url: ajaxURL,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        self.model.set(data);
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
    console.log('hitting the weather render');
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
    var m = moment().local().format('h:mm:ss A');
    $('.current-time')[0].innerHTML = m;
  },

  remove: function() {
    clearInterval( this.timer );
    return Backbone.View.prototype.remove.call( this );
  }

});
