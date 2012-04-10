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
	var streamWidth = 0;
	
	// creates the slider and registers events
	function render() {
		$(_element).addClass('kks_slides');
		
		// load slides
		load();
		
		// display nav
		renderNav();
		
		if (settings.displayNav) {
			showNav();
		} else {
			hideNav();
		}
		
		// display first slide
		if (settings.transition == 'stream') {
			stream();
		} else {
			switchSlide(settings.start);
			$('#kks_button'+settings.start).addClass('selected');
		
			// start slider
			if (settings.autoplay) {
				start();
			}
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
	
	function renderStream(offset) {
		var totalWidth = 0, id = 'kks_'+new Date().getTime();
		
		$(_element).find('.kks_slides_stream').append('<li id="'+id+'"><div></div></li>');
		$(_element).find('#'+id).addClass('active');
			
		$.each(slides, function(i, e) {
			$(slides[i].slide).css({position:'relative'}).clone().appendTo($(_element).find('#'+id).find('div')).show();
			$(slides[i].slide).hide();
			totalWidth += slides[i].width;
		});

		$(_element).find('#'+id).width(totalWidth).show();

		if (offset) {
			$(_element).find('#'+id).css({left:$(_element).width()+'px'});
		}
		
		$(_element).find('#'+id).hover(function() {
			$(_element).find('.kks_slides_stream li').stop(true);
		}, function() {
			stream();
		});
	}
	
	// makes nav bar visible
	function showNav() {
		$(_element).find('.kks_nav').show();
	}
	
	// hides the nav bar
	function hideNav() {
		$(_element).find('.kks_nav').hide();
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
				streamWidth += slides[i].width;
				totalSlides++;
			}
		});

		if (settings.transition == 'stream') {
			$(_element).append('<ul class="kks_slides_stream"></ul>');
			renderStream();
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
		} else if (settings.transition == 'stream-old') {
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
			var offsets = new Array();
			$(slides[currSlide].slide).animate({"left":(currSlideWidth*-1)+'px'}, {
				duration: settings.transitionSpeed,
				easing: settings.easing,
				step: function(now, fx) {
					for (var i=0; i < visible.length; i++) {
						if (offsets[i]) {
							//offsets[i] += now;
						} else {
							offsets.push(0);
							var j=0;
							if (i >0) {
								j=i;
								do {
								offsets[i] += slides[j--].width;
								} while (j > 0);
							}
							
							offsets[i] += currSlideWidth;
						}

						$(slides[visible[i]].slide).css({left:(offsets[i]+now)+'px'});
					}
				},
				complete: function() {
					$old.hide();
				}
			});
		} else {
			$(slides[currSlide].slide).hide();
			$(slides[newSlide].slide).show();
		}
		
		currSlide = newSlide;
	}
	
	function stream() {
		var threshold = 0,		// point which to render new li, so there are no gaps between slides
			rendered = ($(_element).find('.kks_slides_stream li').length>1) ? true : false,		// if a new li has been rendered
			dur = settings.speed;	// transition duration
		
		if (parseInt($(_element).find('.kks_slides_stream > .active').css('left'),10) < 0) {
			dur = dur * (1-(Math.abs(parseInt($(_element).find('.kks_slides_stream > .active').css('left'),10))/streamWidth));
		}
		
		threshold = (streamWidth - $(_element).width())*-1;

		$(_element).find('.kks_slides_stream li:first').animate({"left":(streamWidth*-1)+'px'}, {
			duration: dur,
			easing: settings.easing,
			queue: true,
			step: function(now, fx) {
				if (rendered == false && now < threshold && $(_element).find('.kks_slides_stream li').length < 2) {
					renderStream(true);
					rendered = true;
				} else if (rendered) {
					$(_element).find('.kks_slides_stream li:last').css({left:(streamWidth+now)+'px'});
				}
			},
			complete: function() {
				$(this).remove();
				stream();
			}
		});
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