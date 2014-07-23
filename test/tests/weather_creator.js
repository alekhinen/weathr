var wc = App.WeatherApp.Weather.Creator;
var wd = {
  timezone: 'America/New-York',
  offset: -4,
  currently: {
    temperature: 70,
    apparentTemperature: 74,
    icon: 'partly-cloudy',
    summary: 'It is partly cloudy'
  },
  daily: {
    icon: 'partly-cloudy',
    summary: 'Partly cloudy.',
    data: [{
      sunriseTime: 0,
      sunsetTime: 0,
      temperatureMax: 80,
      temperatureMin: 68
    }]
  },
  hourly: {
    icon: 'partly-cloudy',
    summary: 'Partly cloudy.',
    data: []
  }
};
var gl = {
  address_components: [{
    types: []
  }],
  formatted_address: 'Boston, MA, USA'
};

var expected;

// There's not much to hook into for testing views.
describe( 'Testing weather creators.', function() {

  // weather layout -----------------------------------------------------------
  it( 'should create Weather layout', function() {
    expected = wc.newLayoutView();

    assert.isObject( expected.centerRegion );
    assert.isObject( expected.topLeftRegion );
    assert.isObject( expected.topRightRegion );
    assert.isObject( expected.bottomLeftRegion );
    assert.isObject( expected.bottomRightRegion );
  });

  // forecasts layout ---------------------------------------------------------
  it( 'should create Forecasts layout', function() {
    expected = wc.newForecastsLayout();

    assert.isObject( expected.fcRegion );
  });

  // error view ---------------------------------------------------------------
  it( 'should create Error View', function() {
    expected = wc.newErrorView();

    assert.equal( expected.el.id, 'error' );
  });

  // recent searches ----------------------------------------------------------
  it( 'should create Recent Searches View', function() {
    expected = wc.newRecentSearchesView();

    assert.equal( expected.childViewContainer, '#recent-searches-list' );
    assert.equal( expected.childView, App.WeatherApp.Weather.RecentSearch );
  });

  // recent searches (data) ---------------------------------------------------
  it( 'should create Recent Searches View with data', function() {
    expected = wc.newRecentSearchesView([
      {
        locationURL: 'current',
        formattedLocation: 'Boston, MA'
      },
      {
        locationURL: 'seattle,+wa',
        formattedLocation: 'Seattle, WA'
      }]);

    assert.equal( expected.collection.length, 2 );
  });

  // daily forecasts ----------------------------------------------------------
  it( 'should create Daily Forecasts View', function() {
    expected = wc.newDailyForecastsView( wd );

    assert.equal( expected.childView, App.WeatherApp.Weather.DailyForecast );
    assert.equal( expected.childViewContainer, '#daily-forecast-list' );
  });

  // hourly forecasts ---------------------------------------------------------
  it( 'should create Hourly Forecasts View', function() {
    expected = wc.newHourlyForecastsView( wd );

    assert.equal( expected.childView, App.WeatherApp.Weather.HourlyForecast );
    assert.equal( expected.childViewContainer, '#hourly-forecast-list' );
  });

  // times --------------------------------------------------------------------
  // does not work because svg.js is incompatible with phantomjs.
  // it( 'should create Times View', function() {
  //   expected = wc.newTimesView( wd, gl );

  //   assert.equal( expected.template, '#weather-times' );
  // });

  // current weather ----------------------------------------------------------
  it( 'should create Hourly Forecasts View', function() {
    var expected = wc.newCurrentWeatherView( wd );

    assert.equal( expected.template, '#weather-current-weather' );
  });

});
