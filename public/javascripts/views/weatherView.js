var WeatherView = Backbone.View.extend({

  // el: '#app',
  template: _.template($('#weather-view-template').html()),

  events: {
    'submit #location-search': 'submitLocation',
    'click .daily-item': 'toggleMoreInfo'
  },

  initialize: function() {
    console.log('initializing WeatherView');
    var address, geoLoc, weatherData,
      self = this;

    this.model.on('change', this.render.bind( this ));

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
          console.log('about to call render');
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
    console.trace();
    this.renderGradient( this.model.toJSON() );
    this.$el.html( this.template(this.model.toJSON()) );
    this.renderWeeklyForecast();
    this.renderRecentSearches();
  },

  renderGradient: function( mdl ) {
    var s1, s2, s3;

    var sunrise, sunset, currentTime;

    var daytime = {
      primary: new SVG.Color('rgb(97,155,215)'),
      secondary: new SVG.Color('rgb(192,188,116)')
    };
    var nighttime = {
      primary: new SVG.Color('rgb(54,81,180)'),
      secondary: new SVG.Color('rgb(10,25,52)')
    };

    currentTime = mdl.weather.currently.time,
    sunrise = mdl.weather.daily.data[0].sunriseTime,
    sunset = mdl.weather.daily.data[0].sunsetTime;

    console.log( currentTime, sunrise, sunset );

    window.draw = SVG('super-container').size('100%', '100%');

    if ( (sunrise < currentTime) && (currentTime < sunset) ) {
      window.gradient = draw.gradient('radial', function(stop) {
        s1 = stop.at(0, daytime.secondary);
        s3 = stop.at(1, daytime.primary);
      });
    } else {
      window.gradient = draw.gradient('radial', function(stop) {
        s1 = stop.at(0, nighttime.seconday);
        s3 = stop.at(1, nighttime.primary);
      });
    }

    if ( window.rect ) {
      window.rect.fill( gradient );
    } else {
      window.rect = draw.rect('200%', '200%').attr({
        fill: gradient
      });
    }

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

      appendee = '<li class=\"daily-item\"><div class=\"daily-container\">',
      appendee += date + icon + highLow + moreInfo + '</div></li>';

      this.$el.find( '#forecast-list' ).append( appendee );

    }.bind( this ));
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

      this.$el.find( '.recent-searches-list' ).append( appendee );
      console.log( r );
    }.bind( this ));
  },

  submitLocation: function() {
    var location, locAdd;

    location = $('#location')[0].value.replace( /\s/g, '+' ),
    locAdd = 'weather/address/' + location;

    window.location.hash = locAdd;
  },

  toggleMoreInfo: function( e ) {
    $( e.currentTarget ).toggleClass('active');
    $( e.currentTarget.firstChild.lastChild ).toggle(500);
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
