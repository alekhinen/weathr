// views ----------------------------------------------------------------------
var indexView,
  weatherView,
  weatherModel,
  currentView = null;

// routes ---------------------------------------------------------------------
var Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'weather/address/:address': 'weather'
  }
});

var router = new Router();

router.on('route:index', function() {
  if ( currentView ) {
    currentView.remove();
  }

  indexView = new IndexView();
  indexView.$el.appendTo('#app');
  currentView = indexView;
  indexView.render();
});

router.on('route:weather', function( address ) {
  if ( currentView ) {
    currentView.remove();
  }

  weatherModel = new WeatherModel({
    address: address
  });

  weatherView = new WeatherView({
    model: weatherModel
  });

  weatherView.$el.appendTo('#app');
  weatherView.render();
  currentView = weatherView;
});

Backbone.history.start();
