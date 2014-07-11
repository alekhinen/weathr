var AppController = Marionette.Controller.extend({

  currentView: null,

  initialize: function( options ) {
    console.log( 'initializing the app controller.' );
  },

  index: function() {
    var indexView;
    this.removeCurrentView();

    indexView = new IndexView();
    this.currentView = indexView;
    indexView.$el.appendTo('#app');
    indexView.render();
  },

  weather: function( address ) {
    var weatherView, weatherModel;
    this.removeCurrentView();

    weatherModel = new WeatherModel({
      address: address
    });

    App.recentSearches.unshift( weatherModel );

    weatherView = new WeatherView({
      model: weatherModel
    });

    weatherView.$el.appendTo('#app');
    // weatherView.render();
    this.currentView = weatherView;
  },

  removeCurrentView: function() {
    console.log( 'removing the view - ' + this.currentView ); // DEBUG
    if ( this.currentView ) {
      this.currentView.remove();
      return true;
    }
    return false;
  }

});
