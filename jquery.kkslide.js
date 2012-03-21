/*
* kkSlide - a jQuery image slider plugin
*
* Version: 1.0.0
* Copyright 2012 Kyle Knox - http://20xxproductions.com
*
* Licensed under MIT license
*   http://en.wikipedia.org/wiki/MIT_License
*
* Date: 2012-03-20 21:00:00
*/
(function($) {
$.fn.kkSlide = function(options) {

	var defaults = {
		'autoplay': true,			// if true, start the slideshow as soon as it loads
		'displayNav': true,			// display the navigation buttons at the bottom of the slider
		'easing': 'swing',			// easing effect to use for slide
		'hoverPause' : false,		// pause the slider on mouse over
		'speed': 5000,				// number milliseconds to display a slide
		'start' : 0,				// first slide (starting at 0) to display
		'transition': 'simple',		// transition effect: 	simple (show/hide)
									//						fade (slides fade in/out)
									//						slide (slides slide from left to right)
		'transitionSpeed': 750		// number milliseconds for transition speed
	};
	
	var settings = $.extend(defaults, options);

	return this.each(function() {
		var f = new kkSlide($(this), settings);

		f.render();
	});
};

function kkSlide(element, options) {
	this.render = render;
	this.start = start;
	this.stop = stop;
	this.showNav = showNav;
	this.hideNav = hideNav;
	this.nextSlide = nextSlide;
	this.previousSlide = previousSlide;
	
	var _element = element[0];
	var settings = options;
	var paused = false;
	var currSlide = 0;
	var slides = [];
	var totalSlides = 0;
	var timer;
	
	// creates the slider and registers events
	function render() {
		$(_element).addClass('kks_slides');
		
		// load slides
		load();
		
		// display nav
		renderNav();
		
		if (settings.displayNav) {
			showNav();
		}
		
		// display first slide
		switchSlide(settings.start);
		$('#kks_button'+settings.start).addClass('selected');
		
		// start slider
		if (settings.autoplay) {
			start();
		}
		
		if (settings.hoverPause) {
			$(_element).hover(function() {
				stop();
			}, function() {
				start();
			});
		}
	}
	
	// creates the slider nav
	function renderNav() {
		var button, nav = '<div class="kks_nav"></div>';
		$(_element).append(nav);
		
		for (var i=0; i < totalSlides; i++) {
			button = '<a href="#" id="kks_button'+i+'">&nbsp;</a>';
			
			$(_element).find('.kks_nav').append(button);
		}
		
		$(_element).find('.kks_nav').children().each(function(i, b) {
			$(b).click(function(a) {
				a.preventDefault();
				stop();
				switchSlide(i);
			});				
		});
	}
	
	// makes nav bar visible
	function showNav() {
		$('#kks_nav').fadeIn();
	}
	
	// hides the nav bar
	function hideNav() {
		$('#kks_nav').fadeOut();
	}
	
	// display loading icon and mask
	function showLoader() {
		$(_element).find('.loader').show();
	}
	
	// hide loading icon and mask
	function hideLoader() {
		$(_element).find('.loader').hide();
	}
	
	function load() {
		showLoader();
		
		$(_element).children().each(function(i, e) {
			if ($(e).is('a') || $(e).is('img')) {
				$(e).addClass('slide');
				slides.push(e);
				totalSlides++;
				$(e).hide();
			}
		});
		
		hideLoader();
	}
	
	// display the next slide in the series
	function nextSlide() {
		var s = (currSlide == (totalSlides-1)) ? 0 : currSlide+1;
		
		switchSlide(s);
	}
	
	// display the previous slide in the series
	function previousSlide() {
		var s = (currSlide == 0) ? totalSlides : currSlide-1;
		
		switchSlide(s);
	}
	
	// display the slide referenced by index:s
	function switchSlide(s) {
		if (s < 0) {
			s = 0;
		}
		if (s > (totalSlides-1)) {
			s = totalSlides-1;
		}
		
		if (currSlide == s) {
			if (!$(slides[s]).is(':visible')) {
				$(slides[s]).show();
			}
			return;
		}
		
		$('#kks_button'+currSlide).removeClass('selected');
		$('#kks_button'+s).addClass('selected');
		transitionSlide(s);
	}
	
	// swaps out slides based on transition effect set
	function transitionSlide(newSlide) {
		if (settings.transition == 'slide') {
			// determine width of element and direction of slide
			var w = $(_element).width(), wpx, $old = $(slides[currSlide]);
			var dir = (newSlide < currSlide) ? 'right' : 'left';
			if (dir == 'right') {
				wpx = w;	// final left position of the current slide
				o = -w;		// starting left position of new slide (starts on right side of current slide)
			} else {
				wpx = -w;	// final left position of the current slide
				o = w;		// starting left position of new slide (starts on left side of current slide)
			}
			
			// make new slide visible offscreen
			$(slides[newSlide]).css({'display':'block','top':0,'left':o+'px'});	
			
			$(slides[currSlide]).animate({"left":wpx+'px'}, {
				duration: settings.transitionSpeed,
				easing: settings.easing,
				step: function(now, fx) {
					$(slides[newSlide]).css({'left':(o+now)+'px'});
				},
				complete: function() {
					$old.hide();
				}
			});
		} else if (settings.transition == 'fade') {
			$(slides[currSlide]).fadeOut(settings.transitionSpeed);
			$(slides[newSlide]).fadeIn(settings.transitionSpeed);
		} else {
			$(slides[currSlide]).hide();
			$(slides[newSlide]).show();
		}
		
		currSlide = newSlide;
	}
	
	/* Slideshow functions */
	
	// start the slideshow
	function start() {
		timer = setTimeout(function() { nextSlide();resume(); }, settings.speed);
		paused = false;
	}
	
	// stop the slideshow
	function stop() {
		clearTimeout(timer);
		paused = true;
	}
	
	// utility function to continue slideshow going after next slide
	function resume() {
		if (!paused) {
			timer = setTimeout(function() { nextSlide();resume(); }, settings.speed);
		}
	}
	
};
})(jQuery);