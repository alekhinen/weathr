var Router = Backbone.Marionette.AppRouter.extend({
  controller: new AppController(),
  appRoutes: {
    '': 'index',
    'weather/address/:address': 'weather'
  }
});
