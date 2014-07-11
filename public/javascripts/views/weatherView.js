var WeatherView = Backbone.View.extend({

  // el: '#app',
  template: _.template($('#weather-view-template').html()),

  events: {
    'submit #location-search': 'submitLocation',
    'click .daily-container': 'toggleMoreInfo'
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
        geoLoc = self.getLocationFromCoordinates( lat, lng );
        weatherData = self.getWeatherData( geoLoc );

        if ( weatherData ) {
          self.render();
          self.timer = setInterval( function() {
            self.updateTime( self.model.toJSON() );
          }, 1000 );
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
        this.timer = setInterval( function() {
          self.updateTime( self.model.toJSON() );
        }, 1000 );

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
        self.model.set( 'geoLocation', geoData.results[0] );
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      }
    });

    // return statement must be outside success fn for AJAX to be !async.
    return result;
  },

  getLocationFromCoordinates: function( lat, lng ) {
    var result, geoData,
      self = this;

      console.log( lat, lng );

    $.ajax({
      url: '/geocode/lat/' + lat + '/lng/' + lng,
      type: 'GET',
      async: false,
      success: function( data, status, jqXHR ) {
        geoData = JSON.parse( data );
        // realistically, this could just be the supplied lat & lng.
        result = {
          lat: geoData.results[0].geometry.location.lat,
          lng: geoData.results[0].geometry.location.lng
        };
        self.model.set( 'geoLocation', geoData.results[0] );
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
        self.model.set( 'weather', data );
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
    this.renderGradient();
    this.$el.html( this.template(this.model.toJSON()) );
    this.renderWeeklyForecast();
    this.renderRecentSearches();
  },

  renderGradient: function() {
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
  },

  renderWeeklyForecast: function() {
    var forecast = this.model.get('weather').daily.data;

    _.each( forecast, function( f ) {
      var time, maxTemp, minTemp, icon, date, highLow, moreInfo, appendee;

      time = moment.unix(f.time),
      maxTemp = Math.round( f.temperatureMax ),
      minTemp = Math.round( f.temperatureMin ),
      date = '<p class=\"date\">' + time.format('dddd') + '</p>',
      icon = '<span class=\"step size-18\">',
      icon += '<i class=\"icon ' + f.icon + '\"></i>',
      icon += '</span>',
      highLow = '<p class=\"high-low\">',
      highLow += maxTemp + '<span>&deg;</span>' + ' / ',
      highLow += minTemp + '<span>&deg;</span>',
      highLow += '</p>',
      moreInfo = '<div class=\"more-info\"><p>' + f.summary,
      moreInfo += '</p></div>';

      appendee = '<li><div class=\"daily-container\">',
      appendee += date + icon + highLow + moreInfo + '</div></li>';

      $( '#forecast-list' ).append( appendee );
      console.log( f );

    });
  },

  renderRecentSearches: function() {
    var appendee;
    var rs = App.recentSearches.toJSON();
    var first = true;

    _.each( rs, function( r ) {
      if ( first ) {
        first = false;
        appendee = '<li><a href=\"#/weather/address/' + r.address,
        appendee += '\" class=\"current\">',
        appendee += '<span class=\"step size-14\">',
        appendee += '<i class=\"icon ion-ios7-location\"></i></span>',
        appendee += r.geoLocation.formatted_address + '</li>';
      } else {
        appendee = '<li><a href=\"#/weather/address/' + r.address,
        appendee += '\">',
        appendee += '<span class=\"step size-14\">',
        appendee += '<i class=\"icon ion-ios7-location-outline\"></i></span>',
        appendee += r.geoLocation.formatted_address + '</li>';
      }

      $( '.recent-searches-list' ).append( appendee );
      console.log( r );
    });
  },

  submitLocation: function() {
    var location, locAdd;

    location = $('#location')[0].value.replace( /\s/g, '+' ),
    locAdd = 'weather/address/' + location;

    window.location.hash = locAdd;
  },

  toggleMoreInfo: function( e ) {
    console.log('toggling');
    $( e.currentTarget.lastChild ).toggle(500);
  },

  updateTime: function( mdl ) {
    var timezone, curTime, locTime, ltM, ltm, M, m, a;

    timezone = mdl.weather.offset * -1;
    curTime = moment().local();
    locTime = moment().zone( timezone );
    ltM = locTime.format('h:mm:ss');
    ltm = locTime.format('A');
    M = curTime.format('h:mm');
    m = curTime.format('A');
    a = ltM + '<span> ' + ltm + '</span><h2 id=\"loc\">',
    a += '<span>your local time </span>' + M,
    a += '<span> ' + m + '</span></h2>';

    $('.current-time')[0].innerHTML = a;
  },

  remove: function() {
    clearInterval( this.timer );
    return Backbone.View.prototype.remove.call( this );
  }

});
