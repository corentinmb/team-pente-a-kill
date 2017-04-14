/*!
 * jQuery Final Countdown
 *
 * @author Pragmatic Mates, http://pragmaticmates.com
 * @version 1.1.1
 * @license GPL 2
 * @link https://github.com/PragmaticMates/jquery-final-countdown
 */

(function ($) {
    var settings;
    var timer;
    var circleSeconds;
    var layerSeconds;
    var element;
    var callbackFunction;

    $.fn.final_countdown_secondes = function(options, callback) {
        element = $(this);

        var defaults = $.extend({
            startS: undefined,
            endS: undefined,
            nowS: undefined,
            selectors: {
                value_seconds: '.clock-seconds .val',
                canvas_seconds: 'canvas-seconds',
            },
            seconds: {
                borderColor: '#7995D5',
                borderWidth: '20'
            }
        }, options);

        settings = $.extend({}, defaults, options);

        if (settings.startS === undefined) {
            settings.startS = element.data('startS');
        }

        if (settings.endS === undefined) {
            settings.endS = element.data('endS');
        }

        if (settings.nowS === undefined) {
            settings.nowS = element.data('nowS');
        }

        if (element.data('border-color')) {
           settings.seconds.borderColor = element.data('border-color');
        }

        if (settings.nowS < settings.startS ) {
            settings.startS = settings.nowS;
            settings.endS = settings.nowS;
        }

        if (settings.nowS > settings.endS) {
            settings.startS = settings.nowS;
            settings.endS = settings.nowS;
        }

        if (typeof callback == 'function') { // make sure the callback is a function
            callbackFunction = callback;
        }

        responsive();
        dispatchTimer();
        prepareCounters();
        startCounters();
    };

    function responsive() {
        $(window).load(updateCircles);

        $(window).on('redraw', function() {
            switched = false;
            updateCircles();
        });
        $(window).on('resize', updateCircles);
    }

    function updateCircles() {
        layerSeconds.draw();
    }

    function convertToDeg(degree) {
        return (Math.PI/180)*degree - (Math.PI/180)*90
    }

    function dispatchTimer() {
        timer = {
            total: Math.floor((settings.endS - settings.startS) / 14400),
            seconds: 12 - Math.floor((((settings.endS - settings.nowS) % 14400) % 600) % 12 )
        }
    }

    function prepareCounters(){
        // Seconds
        var seconds_width = $('#' + settings.selectors.canvas_seconds).width()
        var secondsStage = new Kinetic.Stage({
            container: settings.selectors.canvas_seconds,
            width: seconds_width,
            height: seconds_width
        });

        circleSeconds = new Kinetic.Shape({
            drawFunc: function(context) {
                var seconds_width = $('#' + settings.selectors.canvas_seconds).width()
                var radius = seconds_width / 2 - settings.seconds.borderWidth / 2;
                var x = seconds_width / 2;
                var y = seconds_width / 2;

                context.beginPath();
                context.arc(x, y, radius, convertToDeg(0), convertToDeg(timer.seconds * 30));
                context.fillStrokeShape(this);

                $(settings.selectors.value_seconds).html(12 - timer.seconds);
            },
            stroke: settings.seconds.borderColor,
            strokeWidth: settings.seconds.borderWidth
        });

        layerSeconds = new Kinetic.Layer();
        layerSeconds.add(circleSeconds);
        secondsStage.add(layerSeconds);
    }

    function startCounters() {
        var interval = setInterval( function() {
            if (timer.seconds > 11 ) {

                timer.seconds = 1;
            } else {
                timer.seconds++;
            }

            layerSeconds.draw();
        }, 1000);
    }
})(jQuery);
