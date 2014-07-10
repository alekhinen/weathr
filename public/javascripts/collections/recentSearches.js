var RecentSearches = Backbone.Collection.extend({

  model: WeatherModel,

  initialize: function() {
    console.log('initializing the recent searches model!');
  }
});
