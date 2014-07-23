App.module('WeatherApp.Weather',
  function (Weather, App, Backbone, Marionette, $, _) {

  Weather.createResponsiveGradient = function( cur, sunrise, sunset ) {
    var s1, s2, s3, dayToSetP, dayToSetS, setToNightP, setToNightS, p, s;

    // set color objects ------------------------------------------------------
    p = {
      day: 'rgb(97,155,215)',
      set: '#EC8648',
      night: 'rgb(54,81,180)'
    };
    s = {
      day: 'rgb(192,188,116)',
      set: '#FCEA84',
      night: 'rgb(10,25,52)'
    };

    // create SVG colors that morph into each other ---------------------------
    // day -> sunset (primary)
    dayToSetP = new SVG.Color( p.day ).morph( p.set );
    // day -> sunset (secondary)
    dayToSetS = new SVG.Color( s.day ).morph( s.set );
    // sunset -> night (primary)
    setToNightP = new SVG.Color( p.set ).morph( p.night );
    // sunset -> night (secondary)
    setToNightS = new SVG.Color( s.set ).morph( s.night );

    // if the scene already has an SVG element, don't draw another one.
    if ( !window.draw ) {
      window.draw = SVG('super-container').size('100%', '100%');
    }

    // by default, gradient is at daytime.
    window.gradient = draw.gradient('radial', function(stop) {
      s1 = stop.at(0, dayToSetS.at(0));
      s3 = stop.at(1, dayToSetP.at(0));
    });

    // shift sunrise by 300 seconds.
    var sunriseDiff = cur - (sunrise - 300);
    // shift sunset by 600 seconds so that lighting is more realistic
    var sunsetDiff = (sunset - 600) - cur;


    if ( 0 <= sunsetDiff && sunsetDiff <= 3600 ) {
      // TRANSITION ( day -> sunset ) | 60 minutes
      // console.log('day transition into sunset'); // DEBUG
      sunsetDiff = Math.round( (sunsetDiff / 3600) * 100 ) / 100;
      s1.update( 0, dayToSetS.at( 1 - sunsetDiff ) );
      s3.update( 1, dayToSetP.at( 1 - sunsetDiff ) );

    } else if ( -1800 <= sunsetDiff && sunsetDiff < 0 ) {
      // TRANSITION ( sunset -> night ) | 30 minutes
      // console.log('sunset transition into night'); // DEBUG
      sunsetDiff = Math.abs( sunsetDiff );
      sunsetDiff = Math.round( (sunsetDiff / 1800) * 100 ) / 100;
      s1.update( 0, setToNightS.at( sunsetDiff ) );
      s3.update( 1, setToNightP.at( sunsetDiff ) );

    } else if ( -1800 <= sunriseDiff && sunriseDiff < 0 ) {
      // TRANSITION ( night -> sunrise ) | 30 minutes
      // console.log('night transition into sunrise'); // DEBUG
      sunriseDiff = Math.abs( sunriseDiff );
      sunriseDiff = Math.round( (sunriseDiff / 1800) * 100 ) / 100;
      s1.update( 0, setToNightS.at( sunriseDiff ) );
      s3.update( 1, setToNightP.at( sunriseDiff ) );

    } else if ( 0 <= sunriseDiff && sunriseDiff <= 3600 ) {
      // TRANSITION ( sunrise -> day ) | 60 minutes
      console.log('sunrise transition into day'); // DEBUG
      sunriseDiff = Math.round( (sunriseDiff / 3600) * 100 ) / 100;
      s1.update( 0, dayToSetS.at( 1 - sunriseDiff ) );
      s3.update( 1, dayToSetP.at( 1 - sunriseDiff ) );

    } else if ( (sunrise < cur) && (cur < sunset) ) {
      // day
      // console.log('daytime'); // DEBUG
      s1.update( 0, dayToSetS.at(0) );
      s3.update( 1, dayToSetP.at(0) );

    } else {
      // night
      // console.log('nighttime'); // DEBUG
      s1.update( 0, setToNightS.at(1) );
      s3.update( 1, setToNightP.at(1) );
    }

    if ( window.rect ) {
      window.rect.fill( gradient );
    } else {
      window.rect = draw.rect('200%', '200%').attr({
        fill: gradient
      });
    }
  };

});
