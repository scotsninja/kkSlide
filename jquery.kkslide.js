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
		'pauseOnHover' : false,		// pause the slider on mouse over
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
	
	if (settings.transition == 'stream') {
		settings.speed = settings.transitionSpeed;
	}
	
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
		
		if (settings.pauseOnHover) {
			$(_element).hover(function() {
				stop();
			}, function() {
				//start();
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
	
	function renderViewable(visible) {
		var width = $(_element).width(),
			currSlideWidth = slides[currSlide].width,
			visibleWidth = 0,
			i = (currSlide < (totalSlides-1)) ? currSlide : 0;
			visible = new Array();
			
		// calculate which slides will be visible after the first slide is out of view
		while (visibleWidth < (width+currSlideWidth)) {
			$(slides[i].slide).css({'display':'block','top':0,'left':visibleWidth+'px'});
			visibleWidth += slides[i].width;
			visible.push(i);
			i = (i < (totalSlides-1)) ? i+1 : 0;
		}
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
				$(e).hide();
				slides.push({'slide':e,'width':$(e).width()});
				totalSlides++;

			}
		});

		if (settings.transition == 'stream') {
			renderViewable();
			//transitionSlide(totalSlides-1);
		}
		
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
			if (!$(slides[s].slide).is(':visible')) {
				$(slides[s].slide).show();
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
			var w = $(_element).width(), wpx, $old = $(slides[currSlide].slide);
			var dir = (newSlide < currSlide) ? 'right' : 'left';
			if (dir == 'right') {
				wpx = w;	// final left position of the current slide
				o = -w;		// starting left position of new slide (starts on right side of current slide)
			} else {
				wpx = -w;	// final left position of the current slide
				o = w;		// starting left position of new slide (starts on left side of current slide)
			}
			
			// make new slide visible offscreen
			$(slides[newSlide].slide).css({'display':'block','top':0,'left':o+'px'});
			
			$(slides[currSlide].slide).animate({"left":wpx+'px'}, {
				duration: settings.transitionSpeed,
				easing: settings.easing,
				step: function(now, fx) {
					$(slides[newSlide].slide).css({'left':(o+now)+'px'});
				},
				complete: function() {
					$old.hide();
				}
			});
		} else if (settings.transition == 'fade') {
			$(slides[currSlide].slide).fadeOut(settings.transitionSpeed);
			$(slides[newSlide].slide).fadeIn(settings.transitionSpeed);
		} else if (settings.transition == 'stream') {
			//var width = $(_element).width(), $old = $(slides[currSlide].slide), currSlideWidth = $(slides[currSlide]).width(), visibleWidth = 0, i = currSlide+1, visible = new Array();
			var width = $(_element).width(),
				$old = $(slides[currSlide].slide),
				currSlideWidth = slides[currSlide].width,
				visibleWidth = 0,
				i = (currSlide < (totalSlides-1)) ? currSlide+1 : 0;
				visible = new Array();

			// calculate which slides will be visible after the first slide is out of view
			while (visibleWidth < width) {
				$(slides[i].slide).css({'display':'block','top':0,'left':visibleWidth+'px'});
				visibleWidth += slides[i].width;
				visible.push(i);
				i = (i < (totalSlides-1)) ? i+1 : 0;
			}

			// move left slide out of view
			$(slides[currSlide].slide).animate({"left":(currSlideWidth*-1)+'px'}, {
				duration: settings.transitionSpeed,
				easing: settings.easing,
				step: function(now, fx) {
					//$(slides[newSlide].slide).css({left:'+'+now+'px'});
					//$(slides[newSlide].slide).css({'left':(currSlideWidth+now)+'px'});
					//$(slides[(newSlide+1)].slide).css({'left':(currSlideWidth+slides[newSlide].width+now)+'px'});
					//$(slides[(newSlide+2)].slide).css({'left':(currSlideWidth+slides[newSlide].width+slides[(newSlide+1)].width+now)+'px'});
					$.each(visible, function(i, v) {
						var offset = 0, j=0;
						if (i >0) {
							j=i;
							do {
							offset += slides[j--].width;
							} while (j > 0);
						}
						
						offset += currSlideWidth;
						//var offset = (i > 0) ? slides[(visible[i])].width : currSlideWidth;
						//var vo = (v < (totalSlides-1)) ? v+1 : 0;
						//offset = slides[visible[i]].width;
						//offset = slides[vo].width;
						//var offset = $(slides[(slides[visible[i-1])].slide).css('right');
						//console.log(offset);
						$(slides[v].slide).css({'left':(offset+now)+'px'});
					});
				},
				complete: function() {
					$old.hide();
				}
			});
			// slide all slides to right
			
			/*function animation(){
				cloud1();	
			}
			function cloud1(){
				$("#ribbon").animate({left:"-=1600px"},20000).animate({left:"0px"}, 0)
				setTimeout("cloud1()",2000);
			}
			$(document).ready(function() {
				setTimeout("animation()",300);

			});*/
		} else {
			$(slides[currSlide].slide).hide();
			$(slides[newSlide].slide).show();
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