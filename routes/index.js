var express = require('express');
var router  = express.Router();
var config  = require('../config');
var https   = require('https');

// GET / page.
router.get('/', function( req, res ) {
  res.render('index', { title: 'Express' });
});

// GET /geocode/address
router.get('/geocode/address/:address', function( req, res ) {
  console.log('oh mi goodddd');

  var addy  = req.params.address,
    apiPath = '/maps/api/geocode/json?address=' + addy;
    apiPath += '&key=' + process.env.GEOCODE_API_KEY;

  var options = {
    host: 'maps.googleapis.com',
    port: 443,
    path: apiPath,
    method: 'GET'
  };

  var locReq = https.request(options, function( response ) {
    var data = "";

    response.on('data', function (chunk) {
      data += chunk;
    });

    response.on('end', function(){
      console.log( data );
      res.send( data );
    });

  });

  locReq.end();

  locReq.on('error', function(e) {
    console.error(e);
  });

});

module.exports = router;
