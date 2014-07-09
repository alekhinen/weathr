var WeatherView = Backbone.View.extend({

  el: '#app',
  template: _.template($('#weather-view-template').html()),

  events: {
    'submit #index-location-search': 'submitLocation'
  },

  initialize: function() {
    console.log('initializing WeatherView');
    var lat, lng, ajaxURL,
      self = this;

    lat = this.model.attributes.lat,
    lng = this.model.attributes.lng,
    ajaxURL = 'weather/lat/' + lat + '/long/' + lng;

    $.ajax({
      url: ajaxURL,
      type: 'GET',
      success: function( data, status, jqXHR ) {
        console.log( data );
        self.model.set(data);
        self.render();

        setInterval(self.updateTime, 1000);
      }
    });
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

    this.$el.html( this.template(this.model.toJSON()) );
  },

  updateTime: function() {
    var m = moment().local().format('h:mm:ss A');
    $('.current-time')[0].innerHTML = m;
  }

});