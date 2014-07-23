module.exports = {
  dist: {
    src: [
      'public/javascripts/app.js',
      'public/javascripts/entities/weather.js',
      'public/javascripts/apps/weather_app/weather_app.js',
      'public/javascripts/apps/weather_app/colors.js',
      'public/javascripts/apps/weather_app/show/show_view.js',
      'public/javascripts/apps/weather_app/show/show_controller.js',
      'public/javascripts/apps/weather_app/weather/requests.js',
      'public/javascripts/apps/weather_app/weather/weather_view.js',
      'public/javascripts/apps/weather_app/weather/weather_creator.js',
      'public/javascripts/apps/weather_app/weather/weather_controller.js'
    ],
    dest: 'public/compiled/app.js'
  },
  test: {
    src: [
      'test/shims/**/*.js',
      'test/fixtures/**/*.js',
      'test/tests/**/*.js'
    ],
    dest: 'test/test.js'
  }
};
