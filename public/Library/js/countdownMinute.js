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
    var circleMinutes;

    var layerSeconds;
    var layerMinutes;

    var element;
    var callbackFunction;

    $.fn.final_countdown = function(options, callback) {
        element = $(this);

        var defaults = $.extend({
            start: undefined,
            end: undefined,
            now: undefined,
            selectors: {
                value_seconds_opt: '.clock-seconds-m .val_seconds',
                canvas_seconds_opt: 'canvas-seconds-m',
                value_minutes: '.clock-minutes .val',
                canvas_minutes: 'canvas-minutes',
            },
            seconds: {
                borderColor: '#FFF',
                borderWidth: '20'
            },
            minutes: {
                borderColor: '#ACC742',
                borderWidth: '20'
            }
        }, options);

        settings = $.extend({}, defaults, options);

        if (settings.start === undefined) {
            settings.start = element.data('start');
        }

        if (settings.end === undefined) {
            settings.end = element.data('end');
        }

        if (settings.now === undefined) {
            settings.now = element.data('now');
        }

        if (element.data('border-color')) {
            settings.seconds.borderColor = settings.minutes.borderColor = settings.hours.borderColor = settings.days.borderColor = element.data('border-color');
        }

        if (settings.now < settings.start ) {
            settings.start = settings.now;
            settings.end = settings.now;
        }

        if (settings.now > settings.end) {
            settings.start = settings.now;
            settings.end = settings.now;
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
        // layerSeconds.draw();
        layerMinutes.draw();
    }

    function convertToDeg(degree) {
        return (Math.PI/180)*degree - (Math.PI/180)*90
    }

    function dispatchTimer() {
        timer = {
            total: Math.floor((settings.end - settings.start) / 14400),
            minutes: 41 - Math.floor((((settings.end - settings.now) % 14400) % 600) / 10),
            seconds: 41 - Math.floor((((settings.end - settings.now) % 14400) % 600) % 60 )
        }
    }

    function prepareCounters() {
        // Seconds
        var seconds_width = $('#' + settings.selectors.canvas_seconds_opt).width()
        var secondsStage = new Kinetic.Stage({
            container: settings.selectors.canvas_seconds_opt,
            width: seconds_width,
            height: seconds_width
        });

        circleSeconds = new Kinetic.Shape({
            drawFunc: function(context) {
                var seconds_width = $('#' + settings.selectors.canvas_seconds_opt).width()
                var radius = seconds_width / settings.seconds.borderWidth / 2;
                var x = seconds_width / 2;
                var y = seconds_width / 2;

                context.beginPath();
                context.arc(x, y, radius, convertToDeg(0), convertToDeg(timer.seconds * 6));
                context.fillStrokeShape(this);

                $(settings.selectors.value_seconds_opt).html(60 - timer.seconds);
            },
            stroke: settings.seconds.borderColor,
            strokeWidth: settings.seconds.borderWidth
        });

        layerSeconds = new Kinetic.Layer();
        layerSeconds.add(circleSeconds);
        // secondsStage.add(layerSeconds);

        // Minutes
        var minutes_width = $('#' + settings.selectors.canvas_minutes).width();
        var minutesStage = new Kinetic.Stage({
            container: settings.selectors.canvas_minutes,
            width: minutes_width,
            height: minutes_width
        });

        circleMinutes = new Kinetic.Shape({
            drawFunc: function(context) {
                var minutes_width = $('#' + settings.selectors.canvas_minutes).width();
                var radius = minutes_width / 2 - settings.minutes.borderWidth / 2;
                var x = minutes_width / 2;
                var y = minutes_width / 2;

                context.beginPath();
                context.arc(x, y, radius, convertToDeg(0), convertToDeg(timer.minutes * 36.5));
                context.fillStrokeShape(this);

                $(settings.selectors.value_minutes).html(10 - timer.minutes);

            },
            stroke: settings.minutes.borderColor,
            strokeWidth: settings.minutes.borderWidth
        });

        layerMinutes = new Kinetic.Layer();
        layerMinutes.add(circleMinutes);
        minutesStage.add(layerMinutes);
    }

    function startCounters() {
        var interval = setInterval( function() {
            if (timer.seconds > 59 ) {
                if (10 - timer.minutes == 0 ) {
                    clearInterval(interval);
                    if (callbackFunction !== undefined) {
                        callbackFunction.call(this); // brings the scope to the callback
                    }
                    return;
                }

                timer.seconds = 1;

                if (timer.minutes > 10) {
                    timer.minutes = 1;
                    layerMinutes.draw();
                } else {
                    timer.minutes++;
                }

                layerMinutes.draw();
            } else {
                timer.seconds++;
            }

            layerSeconds.draw();
        }, 1000);
    }
})(jQuery);
