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
  address_components: [],
  formatted_address: 'Boston, MA, USA'
};

describe( 'Testing weather creators.', function() {

  // weather layout -----------------------------------------------------------
  it( 'should create Weather layout', function() {
    assert.ok( wc.newLayoutView(), new App.WeatherApp.Weather.Layout() );
  });

  // forecasts layout ---------------------------------------------------------
  it( 'should create Forecasts layout', function() {
    assert.ok( wc.newForecastsLayout(),
      new App.WeatherApp.Weather.ForecastsLayout() );
  });

  // error view ---------------------------------------------------------------
  it( 'should create Error View', function() {
    assert.ok( wc.newErrorView(),
      new App.WeatherApp.Weather.ErrorView() );
  });

  // recent searches ----------------------------------------------------------
  it( 'should create Recent Searches View', function() {
    assert.ok( wc.newRecentSearchesView(),
      new App.WeatherApp.Weather.RecentSearches() );
  });

  // recent searches (data) ---------------------------------------------------
  it( 'should create Recent Searches View with data', function() {
    assert.ok( wc.newRecentSearchesView([
      {
        locationURL: 'current',
        formattedLocation: 'Boston, MA'
      },
      {
        locationURL: 'seattle,+wa',
        formattedLocation: 'Seattle, WA'
      }]),
      new App.WeatherApp.Weather.RecentSearches([
        {
          locationURL: 'current',
          formattedLocation: 'Boston, MA'
        },
        {
          locationURL: 'seattle,+wa',
          formattedLocation: 'Seattle, WA'
        }]) );
  });

  // daily forecasts ----------------------------------------------------------
  it( 'should create Daily Forecasts View', function() {
    assert.ok( wc.newDailyForecastsView( wd ),
      new App.WeatherApp.Weather.DailyForecasts( wd ) );
  });

  // hourly forecasts ---------------------------------------------------------
  it( 'should create Hourly Forecasts View', function() {
    assert.ok( wc.newHourlyForecastsView( wd ),
      new App.WeatherApp.Weather.HourlyForecasts( wd ) );
  });

  // times --------------------------------------------------------------------
  // does not work because svg.js is incompatible with phantomjs.
  // it( 'should create Times View', function() {
  //   assert.ok( wc.newTimesView( wd, gl ),
  //     new App.WeatherApp.Weather.Times( wd, gl ));
  // });

  // current weather ----------------------------------------------------------
  it( 'should create Hourly Forecasts View', function() {
    assert.ok( wc.newCurrentWeatherView( wd ),
      new App.WeatherApp.Weather.CurrentWeather( wd ) );
  });

});
