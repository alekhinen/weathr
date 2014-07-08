// views ----------------------------------------------------------------------
var appView = new AppView();

// routes ---------------------------------------------------------------------
var Router = Backbone.Router.extend({
  routes: {
    '': 'home'
  }
});

var router = new Router();
router.on('route:home', function() {
  appView.render();
});

Backbone.history.start();
