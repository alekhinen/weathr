var express = require('express');
var router  = express.Router();
var config  = require('../config');
var https   = require('https');

// GET /geocode/address -------------------------------------------------------
router.get('/address/:address', function( req, res ) {

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
    var data = '';
    response.on( 'data', function ( chunk ) {
      data += chunk;
    });
    response.on( 'end', function() {
      res.send( data );
    });
  });

  locReq.end();

  locReq.on('error', function(e) {
    console.error(e);
  });

});

// GET /geocode/lat/:lat/lng/:lng ---------------------------------------------
router.get('/lat/:lat/lng/:lng', function( req, res ) {
  var apiPath, options, locReq, data,
    rp = req.params;

  apiPath = '/maps/api/geocode/json?latlng=' + rp.lat + ',' + rp.lng,
  apiPath += '&key=' + process.env.GEOCODE_API_KEY;
  options = {
    host: 'maps.googleapis.com',
    port: 443,
    path: apiPath,
    method: 'GET'
  };

  locReq = https.request( options, function( response ) {
    data = '';
    response.on( 'data', function( chunk ) {
      data += chunk;
    });
    response.on( 'end', function() {
      res.send( data );
    });
  });

  locReq.end();
  locReq.on('error', function( e ) {
    console.error( e );
  });

});

module.exports = router;
