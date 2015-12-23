var express  = require('express');
var router   = express.Router();
var Forecast = require('forecast.io');
var config   = require('../config');
var cors     = require('cors');

var options = {
  APIKey: process.env.FORECAST_API_KEY,
  timeout: 1000
},
forecast = new Forecast(options);

// GET /weather/lat/:lat/lng/:lng
router.get('/lat/:lat/lng/:lng', cors(), function(req, res) {
  var rp = req.params,
    lat = rp.lat,
    lng = rp.lng;

  forecast.get(lat, lng, function (err, result, data) {
    if ( err ) {
      console.error( err );
    }
    res.send( data );
  });

});

// GET /weather/location/:location
router.get( '/location/:location', function( req, res ) {

  res.render('index', { title: 'Weathr' });

});

module.exports = router;
