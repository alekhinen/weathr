var express  = require('express');
var router   = express.Router();
var Forecast = require('forecast.io');

var options = {
  APIKey: '56359165e622c2711b40cee3bec02d73',
  timeout: 1000
},
forecast = new Forecast(options);

// GET weather/:city
router.get('/lat/:lat/long/:lng', function(req, res) {
  var rp = req.params,
    lat = rp.lat,
    lng = rp.lng;

  forecast.get(lat, lng, function (err, result, data) {
    if (err) {
      throw err;
    }
    res.send( data );
  });

});

module.exports = router;
