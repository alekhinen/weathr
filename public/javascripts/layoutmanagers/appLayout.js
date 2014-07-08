var AppLayout = Backbone.Layout.extend({

  el: '#app',
  template: _.template($('#app-view-template').html()),

  views: {
    '.content': new LocationView()
  },

  initialize: function() {
    console.log('intializing appLayout');
  },

  render: function() {
    this.$el.html( this.template );
  }

});
