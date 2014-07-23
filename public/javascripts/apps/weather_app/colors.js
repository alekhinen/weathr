App.module('WeatherApp.Colors',
  function (Colors, App, Backbone, Marionette, $, _) {

  // Gradients ----------------------------------------------------------------
  // colors used for the various gradients
  Colors.Gradients = {
    day: {
      prim: 'rgb(97,155,215)',
      secnd: 'rgb(192,188,116)'
    },
    sunset: {
      prim: 'rgb(236,134,72)',
      secnd: 'rgb(252,234,132)'
    },
    night: {
      prim: 'rgb(54,81,180)',
      secnd: 'rgb(10,25,52)'
    },
    sunrise: {
      prim: 'rgb(236,134,72)',
      secnd: 'rgb(252,234,132)'
    }
  };

  // createMouseMovementGradient() --------------------------------------------
  // creates a gradient based off of mouse movements.
  Colors.createMouseMovementGradient = function( e ) {
    var percX, percY, g, colors;

    g = Colors.Gradients;

    // Get a percentage value of where the mouse is.
    percX = Math.round( ( e.pageX / $(document).width() ) * 100 ) / 100;
    percY = Math.round( ( e.pageY / $(document).height() ) * 100 ) / 100;

    // Set the colors into an SVG.
    colors = {
      primary: new SVG.Color( g.day.prim ),
      secondary: new SVG.Color( g.day.secnd )
    };

    // Set colors based on mouse position of page.
    var dayToSetP = new SVG.Color( g.day.prim ).morph( g.sunset.prim );
    var dayToSetS = new SVG.Color( g.day.secnd ).morph( g.sunset.secnd );
    var setToNightP = new SVG.Color( g.sunset.prim ).morph( g.night.prim );
    var setToNightS = new SVG.Color( g.sunset.secnd ).morph( g.night.secnd );

    if ( percX <= 0.5 ) {
      percX = Math.round( (percX / 0.5) * 100 ) / 100;
      colors.primary = dayToSetP.at( percX );
    } else if ( percX > 0.5 ) {
      percX = Math.round( ( (percX - 0.5) / 0.5 ) * 100 ) / 100;
      colors.primary = setToNightP.at( percX );
    }

    if ( percY <= 0.5 ) {
      percY = Math.round( (percY / 0.5) * 100 ) / 100;
      colors.secondary = dayToSetS.at( percY );
    } else if ( percY > 0.5 ) {
      percY = Math.round( ( (percY - 0.5) / 0.5 ) * 100 ) / 100;
      colors.secondary = setToNightS.at( percY );
    }

    return colors;
  };

  // createTimeBasedGradient() ------------------------------------------------
  // creates a gradient based off of time of day.
  Colors.createTimeBasedGradient = function( cur, sunrise, sunset ) {
    var dayToSetP, dayToSetS, setToNightP, setToNightS, g, colors;

    g = Colors.Gradients;

    // create SVG colors that morph into each other
    // day -> sunset (primary)
    dayToSetP = new SVG.Color( g.day.prim ).morph( g.sunset.prim );
    // day -> sunset (secondary)
    dayToSetS = new SVG.Color( g.day.secnd ).morph( g.sunset.secnd );
    // sunset -> night (primary)
    setToNightP = new SVG.Color( g.sunset.prim ).morph( g.night.prim );
    // sunset -> night (secondary)
    setToNightS = new SVG.Color( g.sunset.secnd ).morph( g.night.secnd );

    // by default, gradient is at daytime.
    colors = {
      primary: dayToSetP.at( 0 ),
      secondary: dayToSetS.at( 0 )
    };

    // shift sunrise by 300 seconds (for realistic lighting)
    var sunriseDiff = cur - (sunrise - 300);
    // shift sunset by 600 seconds (for realistic lighting)
    var sunsetDiff = (sunset - 600) - cur;

    if ( 0 <= sunsetDiff && sunsetDiff <= 3600 ) {
      // TRANSITION ( day -> sunset ) | 60 minutes
      // diff increments as time goes on.
      sunsetDiff = Math.round( (sunsetDiff / 3600) * 100 ) / 100;
      colors.primary   = dayToSetP.at( 1 - sunsetDiff );
      colors.secondary = dayToSetS.at( 1 - sunsetDiff );

    } else if ( -1800 <= sunsetDiff && sunsetDiff < 0 ) {
      // TRANSITION ( sunset -> night ) | 30 minutes
      // diff increments as time goes on.
      sunsetDiff = Math.abs( sunsetDiff );
      sunsetDiff = Math.round( (sunsetDiff / 1800) * 100 ) / 100;
      colors.primary   = setToNightP.at( sunsetDiff );
      colors.secondary = setToNightS.at( sunsetDiff );

    } else if ( -1800 <= sunriseDiff && sunriseDiff < 0 ) {
      // TRANSITION ( night -> sunrise ) | 30 minutes
      // diff decrements as time goes on.
      sunriseDiff = Math.abs( sunriseDiff );
      sunriseDiff = Math.round( (sunriseDiff / 1800) * 100 ) / 100;
      colors.primary   = setToNightP.at( sunriseDiff );
      colors.secondary = setToNightS.at( sunriseDiff );

    } else if ( 0 <= sunriseDiff && sunriseDiff <= 3600 ) {
      // TRANSITION ( sunrise -> day ) | 60 minutes
      // diff increments as time goes on.
      sunriseDiff = Math.round( (sunriseDiff / 3600) * 100 ) / 100;
      colors.primary   = dayToSetP.at( 1 - sunriseDiff );
      colors.secondary = dayToSetS.at( 1 - sunriseDiff );


    } else if ( (sunrise < cur) && (cur < sunset) ) {
      // daytime
      colors.primary   = dayToSetP.at(0);
      colors.secondary = dayToSetS.at(0);

    } else {
      // nighttime
      colors.primary   = setToNightP.at(1);
      colors.secondary = setToNightS.at(1);

    }

    return colors;
  };

});
