var express  = require('express');
var router   = express.Router();
var Forecast = require('forecast.io');
var config   = require('../config');

var options = {
  APIKey: process.env.FORECAST_API_KEY,
  timeout: 1000
},
forecast = new Forecast(options);

// GET weather/lat/:lat/lng/:lng
router.get('/lat/:lat/lng/:lng', function(req, res) {
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

module.exports = router;
