// views ----------------------------------------------------------------------
var indexView,
  weatherView,
  weatherModel,
  currentView = null;

// routes ---------------------------------------------------------------------
var Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'weather/lat/:lat/long/:lng': 'weather'
  }
});

var router = new Router();

router.on('route:index', function() {
  if ( currentView ) {
    currentView.remove();
  }

  indexView = new IndexView();
  currentView = indexView;
  indexView.render();
});

router.on('route:weather', function( lat, lng ) {
  if ( currentView ) {
    currentView.remove();
  }

  weatherModel = new WeatherModel({
    lat: lat,
    lng: lng
  });

  weatherView = new WeatherView({
    model: weatherModel
  });
  console.log( weatherView );
  currentView = weatherView;
  weatherView.initialize();
});

Backbone.history.start();
