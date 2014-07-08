// views ----------------------------------------------------------------------
var appLayout = new AppLayout();

// routes ---------------------------------------------------------------------
var Router = Backbone.Router.extend({
  routes: {
    '': 'home'
  }
});

var router = new Router();
router.on('route:home', function() {
  appLayout.render();
});

Backbone.history.start();
