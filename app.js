// dependencies ---------------------------------------------------------------
var express      = require('express');
var path         = require('path');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var hbs          = require('express-hbs');

// routes ---------------------------------------------------------------------
var routes  = require('./routes/index');
var weather = require('./routes/weather');
var geocode = require('./routes/geocode');

var app = express();

// view engine setup
app.engine( 'hbs', hbs.express3({
  defaultLayout: 'views/layout',
  partialsDir: [
    __dirname + '/views/shared',
    __dirname + '/views/templates'
  ]
}));
app.set( 'view engine', 'hbs' );
app.set('views', path.join(__dirname, 'views'));

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'lib')));

app.use('/', routes);
app.use('/weather', weather);
app.use('/geocode', geocode);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
