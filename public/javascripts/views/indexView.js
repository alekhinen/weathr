var IndexView = Backbone.View.extend({

  el: '#app',
  template: _.template($('#index-view-template').html()),

  events: {
    'submit #index-location-search': 'submitLocation'
  },

  initialize: function() {
    console.log('initializing IndexView');
    $('body').on('mousemove', this.updateGradient);
  },

  render: function() {
    var s1, s2, s3;

    window.draw = SVG('super-container').size('100%', '100%');
    window.gradient = draw.gradient('radial', function(stop) {
      s1 = stop.at(0, '#a12f42');
      s2 = stop.at(0.4, '#872736');
      s3 = stop.at(1, '#1d1e65');
    });
    // gradient.from(0, 0).to(0, 1).radius(1);
    window.rect = draw.rect('200%', '200%').attr({
      fill: gradient
    });

    this.$el.html( this.template );
  },

  updateGradient: function( e ) {
    var pWidth, pHeight, mX, mY, percX, percY,
      red, green, blue, max, col, col2;

    max = 255,
    pWidth = $(document).width(),
    pHeight = $(document).height(),
    mX = e.pageX,
    mY = e.pageY,
    percX = Math.round( ((mX / pWidth) * 100) ),
    percY = Math.round( ((mY / pHeight) * 100) );

    red = Math.round(percX * 1.5),
    green = Math.round(percY * 1.5);
    blue = max - Math.round( ( (red + green) / 510 ) * 100 ) - 50;

    col = new SVG.Color({ r: red, g: green, b: blue });
    col2 = new SVG.Color({ r: 255, g: red, b: green });

    gradient.update(function(stop) {
      s1 = stop.at(0, col2);
      s3 = stop.at(1, col);
    });
  },

  submitLocation: function() {
    var ajaxURL, location;

    ajaxURL  = 'https://maps.googleapis.com/maps/api/geocode/json?address=',
    location = $('#location')[0].value.replace( ' ', '+' ),
    ajaxURL += location,
    ajaxURL += '&key=AIzaSyDsoiGdxsSykpanHXRRsqfCsF4xwUKkgQQ';
    console.log('submitting location...');

    $.ajax({
      url: ajaxURL,
      type: 'GET',
      success: function( data, status, jqXHR ) {
        var dLat = data.results[0].geometry.location.lat,
          dLong  = data.results[0].geometry.location.lng,
          newLoc = '#weather/lat/' + dLat + '/long/' + dLong ;
        console.log( newLoc );
        window.location.hash = newLoc;
      },
      error: function( jqXHR, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      }
    });
  }

});
