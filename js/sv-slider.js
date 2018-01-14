/*********************************************
 * SV-SLIDER (jQuery/CSS slider for website)
 *********************************************
 *
 * Developed by: Pau Sanchez V.
 *
 * website:     pausanchezv.com
 * Github:      github.com/pausanchezv
 * Linkedin:    linkedin.com/in/pausanchezv
 * Twitter:     twitter.com/pausanchezv
 * Facebook:    facebook.com/pausanchezv
 *
 * All rights reserved. - Barcelona 2018 -
 *
 **********************************************/

(function($) {

	// Initializing the plugin
	$.fn.slider = function(settings) {

		// constants
		var CAPTION_MARGIN = 15;
		var BUTTONS_SIZE = 15;

		// globals
		var intervals = [];					// interval array
		var browser = $(window);			// browser object
		var slider = $(this);				// slider DOM object
		var settings = init(settings);		// get custom setting
		var inTransition = false;			// indicates if there is a transition

		// Checks the customized types user's values
		if (!checkValues()) {
			return false;
		}


		/**
		 * Initializes the plugin configuration with user preferences
		 * @param settings
		 */
		function init (settings) {

			var settings = $.extend(true, {

				width: "100%",					// string :: px or %
				randomFront: false,				// bool
				timeEffect: 400,				// int :: milliseconds
				animation: 'rotation',			// string :: options { rotation, translation, vibration, zoom }
				overflowHidden: true,			// bool
				borderSize: 1,					// int :: px
				borderColor: "#999",			// string :: html, rgb, rgba or text color
				borderRadius: 0,				// int :: px
				paddingSize: 6,					// int:: max 50
				paddingColor: "transparent",	// string :: html, rgb, rgba or text color
				buttonsHiddenEffect: false,		// bool
				boomerang: true,				// bool
				filter: "off",					// string :: options { white, black, green, blue, red, magenta, yellow, cyan, gray }
				showPager: true,				// boolean
				autoplay: true,					// boolean
				autoplayInterval: 6000,			// int :: milliseconds
				shadowSize: 0,                  // int :: px
				shadowColor: "#666",            // string :: html, rgb or rgba color

				caption: {

					animation: "slide",							// string :: options { slide, fade }
					float: "left",								// string :: options { left, right }
					position: "bottom",							// string :: options { top, bottom }
					backgroundColor: "rgba(0, 5, 10, 0.6)",		// string :: html, rgb, rgba or text color
					borderSize: 0,								// int
					borderColor: "#FFF",						// string :: html, rgb, rgba or text color
					borderRadius: 0,							// int
					fontColor: "#FFF",							// string :: html, rgb, rgba or text color
					fontSize: 25,								// int
					fontBold: false,							// bool
					fontItalic: false,							// bool
					shadowSize: 0,                  // int :: px
					shadowColor: "#666",            // string :: html, rgb or rgba color

				},

				pager: {
					dark: false,
					transitionHidden: true,			// bool
					float: "center",				// string :: options { left, right, center }
					position: "bottom",				// string :: options { top, bottom }
					background: "off",              // string :: options { white, dark, off }
				},

			}, settings);

			return settings;

		}


		/**
		 * Gets the orientations of the animations
		 * @param obj
		 * @returns {{x: string, y: string}}
		 */
		var getDirections = function(obj) {

			var x = $(obj).data('direction') == 'left' ? 'left' : 'right';
			var y = $(obj).data('direction') == 'right' ? 'left' : 'right';

			return {x: x, y: settings.boomerang ? y : x};
		};


		/**
		 * Updates time of effects
		 * @param str
		 * @param time
		 */
		var addDurationEffects = function(str, time) {
			if (str.toString().indexOf('vibration') === -1) {
				$('.' + str + 'left').css('animation-duration', time + 'ms');
				$('.' + str + 'right').css('animation-duration', time + 'ms');
			}
		};


		/**
		 * Handles CSS of slider
		 * @param obj
		 */
		var sliderHandler = function(obj) {

			if (settings.paddingSize > 50) settings.paddingSize = 50;

			obj.css({
				'border': 'solid ' + settings.borderColor + ' ' + settings.borderSize + "px",
				'border-radius': settings.borderRadius + "px",
				'padding': settings.paddingSize + "px",
				'background-color': settings.paddingColor,
				'width': settings.width
			});

			obj.find('img').css('border-radius', settings.borderRadius + "px");

			if (!settings.overflowHidden) {
				obj.css('overflow', 'visible');
			}

			if (settings.paddingSize < 1) {
				obj.css('background-color', "transparent");
			}

			if (settings.shadowSize > 0) {
				obj.css('box-shadow', "0px 1px " + settings.shadowSize + "px " + parseInt(settings.shadowSize / 5) + "px " + settings.shadowColor);
			}
		};


		/**
		 * Handles the buttons effect
		 * @param obj
		 * @param gone
		 */
		var hiddenButtonsWhileTransition = function(obj, gone) {

			if (settings.buttonsHiddenEffect) {
				if (gone) {
					obj.find('.buttons').fadeOut(150);
				} else {
					obj.find('.buttons').fadeIn();
				}
			}
		};


		/**
		 * Handles the pager effect
		 * @param obj
		 * @param gone
		 */
		var hiddenPagerWhileTransition = function(obj, gone) {

			if (settings.pager.transitionHidden) {
				if (gone) {
					obj.find('.pager').fadeOut(150);
				} else {
					obj.find('.pager').fadeIn();
				}
			}
		};


		/**
		 * Add the image number according to it order
		 * @param obj
		 */
		var addNumbersToImages = function(obj) {
			obj.children('img').each(function(i, el) {
				$(el).attr('data-number', i + 1);
			});
		};


		/**
		 * Returns a DOM image according to it order
		 * @param obj
		 * @param number
		 * @returns {*|{}}
		 */
		var getImageDOM = function (obj, number) {
			return obj.find("img[data-number='" + number + "']");
		};


		/**
		 * Adds buttons to slider
		 * @param obj
		 */
		var addButtons = function(obj) {

			var html = '<div class="buttons">' +
				'<a class="left" data-direction="left"><img src="/test/assets/img/slider/left.png" /></a>' +
				'<a class="right" data-direction="right"><img src="/test/assets/img/slider/right.png" /></a>' +
				'</div>';
			$(html).insertAfter(obj.find("img:last-child")).fadeIn();

			var height = obj.find("img").height();
			obj.find(".buttons > a").css('bottom', height / 2 - BUTTONS_SIZE + "px"); // 7.5 és la meitat de la mida de la fletxa
			obj.find(".buttons > a.left").css('left', settings.paddingSize + BUTTONS_SIZE + "px");
			obj.find(".buttons > a.right").css('right', settings.paddingSize + BUTTONS_SIZE + "px");
		};


		/**
		 * Adds captions to slider
		 * @param obj
		 * @param currentImage
		 */
		var addCaption = function(obj, currentImage) {

			var html = '<div class="caption"></div>';
			$(html).insertAfter(obj.find(".buttons"));

			// updates the customized CSS
			obj.find('.caption').css({
				"background-color": settings.caption.backgroundColor,
				"padding": "20px",
				"color": settings.caption.fontColor,
				"font-size": settings.caption.fontSize + "px",
				"border-radius": settings.caption.borderRadius + "px",
				"font-weight": settings.caption.fontBold ? "bold" : "normal",
				"font-style": settings.caption.fontItalic ? "italic" : "normal",
				'border': 'solid ' + settings.caption.borderColor + ' ' + settings.caption.borderSize + "px",
			});

			if (settings.caption.position === 'bottom') {
				obj.find('.caption').css("bottom", settings.paddingSize + 15 + "px");
			} else {
				obj.find('.caption').css("top", settings.paddingSize + 15 + "px");
			}

			if (settings.caption.float === "left") {
				obj.find('.caption').css("left", settings.paddingSize + CAPTION_MARGIN + "px");
			} else {
				obj.find('.caption').css("right", settings.paddingSize + CAPTION_MARGIN + "px");
			}

			if (settings.caption.shadowSize > 0) {
				obj.find('.caption').css('box-shadow', "0px 1px " + settings.shadowSize + "px " + parseInt(settings.shadowSize / 5) + "px " + settings.shadowColor);
			}

			// adds the first caption
			changeCaption(slider, currentImage);
		};


		/**
		 * Change the captions of the images
		 * @param obj
		 * @param number
		 */
		var changeCaption = function(obj, number) {

			var text = getImageDOM(obj, number).data('caption');
			var caption = obj.find('.caption');

			// just shows the caption if user has added text to it
			if (text !== undefined && text !== "") {

				if (settings.caption.animation === "fade") {

					caption.fadeIn();

				} else if (settings.caption.animation === "slide") {

					if (settings.caption.float === 'left') {
						caption.show().animate({'left': (CAPTION_MARGIN + settings.paddingSize).toString() + 'px'}, settings.timeEffect, 'swing');

					} else {
						caption.show().animate({'right': (CAPTION_MARGIN + settings.paddingSize).toString() + 'px'}, settings.timeEffect, 'swing');

					}
				}

				caption.html(text);

			} else {
				obj.find('.caption').hide();
			}
		};


		/**
		 * Remove images captions
		 * @param obj
		 * @param number
		 * @param direction
		 */
		var removeCaption = function(obj, number, direction) {

			// if there is no direction parameter, it's assigned to the left by default
			direction = direction === undefined ? "left" : direction;

			var caption = obj.find('.caption');

			// if the effect is 'fade', then just hide the caption
			if (settings.caption.animation === "fade") {
				caption.fadeOut();

				// if the effect is 'slide', then animate the caption
			} else if (settings.caption.animation === "slide") {

				// el recorregut és l'amplada de tot l'slider menys l'amplada de la caption
				// distance is slider-width without caption-width and double padding-size + double caption-margin
				var distance = obj.width() - caption.width() - (settings.paddingSize * 2 + CAPTION_MARGIN * 2);

				// checks the caption position
				if (settings.caption.float === 'left') {

					// checks the animation direction
					if (direction == 'left') {
						caption.animate({'left': -distance  + 'px'}, settings.timeEffect, 'swing', function() {
							caption.css('left', distance + 'px');
						});
					}
					else {
						caption.animate({'left': distance + 'px'}, settings.timeEffect, 'swing', function() {
							caption.css('left', -distance + 'px');
						});
					}

					// checks the caption position
				} else {

					// checks the animation direction
					if (direction == 'left') {
						caption.animate({'right': distance + 'px'}, settings.timeEffect, 'swing', function() {
							caption.css('right', -distance + 'px');
						});
					}
					else {
						caption.animate({'right': -distance + 'px'}, settings.timeEffect, 'swing', function() {
							caption.css('right', distance + 'px');
						});
					}
				}
			}
		};


		/**
		 * Adds a filter to the slider
		 * @param obj
		 */
		var addFilter = function(obj) {

			var width = obj.width() + "px";
			var height = obj.height()+ "px";

			obj.append("<div class='filter'></div>");

			obj.find('.filter').css({
				'background-color': getFilter(settings.filter),
				'top': settings.paddingSize + "px",
				'left': settings.paddingSize + "px",
				'width': width,
				'height': height
			});

		};


		/**
		 * Gets the filter by key
		 * @param key
		 * @returns {*}
		 */
		var getFilter = function(key) {

			var filters = {
				red: "rgba(255, 0, 0, .4)",
				green: "rgba(0, 255, 0, .4)",
				blue: "rgba(0, 0, 255, .4)",
				cyan: "rgba(0, 255, 255, .4)",
				yellow: "rgba(255, 255, 0, .4)",
				magenta: "rgba(255, 0, 255, .4)",
				white: "rgba(255, 255, 255, .4)",
				black: "rgba(0, 0, 0, .4)",
				gray: "rgba(100, 100, 100, .4)",
			};

			return filters[key];
		};


		/**
		 * Adds a pager to slider
		 * @param obj
		 * @param numImages
		 */
		var addPager =  function(obj, numImages) {

			var html = '<div class="pager"></div>';

			// inserts the html
			$(html).insertAfter(obj.find('.filter'));
			var pager = obj.find('.pager');

			// adds data to div
			for (var i = 0; i < numImages; i++) {
				pager.append('<div data-number="' + (i + 1) + '"></div>');
			}

			var left;

			// pager horizontal align
			if (settings.pager.float === 'center') left = (obj.width() / 2 - (pager.width() / 2)) + settings.paddingSize;
			else if (settings.pager.float === 'left') left = settings.paddingSize + CAPTION_MARGIN;
			else if (settings.pager.float === 'right') left = obj.width() - pager.width() + settings.paddingSize - CAPTION_MARGIN;

			// pager CSS
			pager.css({
				'width': 'auto',
				'left': left + 'px'
			});

			// pager vertical align
			if (settings.pager.position === 'top') {
				pager.css('top', 20 + settings.paddingSize + "px");

			} else {
				pager.css('bottom', 20 + settings.paddingSize + "px");
			}

			// removes the margin of the last child
			pager.find('div:last-child').css('margin', 0);

			// checks the pager color
			if (settings.pager.dark) {
				pager.addClass('dark');
			}

			// checks if pager has background or not
			if (settings.pager.background !== 'off') {
				pager.addClass('bg');

				if (settings.pager.background === 'dark') {
					pager.addClass('bg-dark');
				}
			}

			if (!settings.showPager) {
				pager.hide();
			}
		};


		/**
		 * Selects an item from the pager
		 * @param obj
		 * @param number
		 */
		var addPagerSelected = function(obj, number) {
			obj.find('div').removeClass('selected');
			obj.find("div[data-number='" + number + "']").addClass('selected');
		};


		/**
		 * Adds interval html bar
		 * @param obj
		 */
		var addInterval = function(obj) {

			if (settings.autoplay) {
				$('<div class="interval-bar"></div>').insertAfter(obj.find('.pager'));
				obj.find('.interval-bar').css('bottom', settings.paddingSize);
			}
		};


		/**
		 * Adds animation to interval bar
		 * @param obj
		 */
		var addIntervalAnimation = function(obj) {
			if (settings.autoplay) {
				obj.find('.interval-bar').css('width', '0').show().stop(true).animate({'width': obj.width() + 'px'}, settings.autoplayInterval, 'swing');
			}
		};


		/**
		 * Starts the automatic play
		 * @param obj
		 */
		var startInterval = function(obj) {

			if (settings.autoplay) {
				intervals.push(setInterval(intervalHandler, settings.autoplayInterval, obj));
			}
		};


		/**
		 * Assigns the event to the automatic play
		 * @param obj
		 */
		var intervalHandler = function(obj) {

			if (settings.autoplay) {
				obj.find('.buttons > a.right').trigger('click');
			}
		};


		/**
		 * Stops the automatic reproduction
		 * @param obj
		 */
		var stopInterval = function(obj) {

			if (settings.autoplay) {

				obj.find('.interval-bar').hide();

				// removes all previous intervals
				intervals.forEach(clearInterval);
				intervals = [];
			}
		};


		/**
		 * Tabs handler
		 * @param obj
		 */
		var tabHandler = function(obj) {

			browser.focus(function() {
				startInterval(obj);
				addIntervalAnimation(obj);
			});

			browser.blur(function() {
				stopInterval(obj);
			});
		};


		/**
		 * Actions before transition
		 * @param obj
		 */
		var addActionsBeforeTransition = function(obj) {

			inTransition = true;

			hiddenButtonsWhileTransition(obj, true);
			hiddenPagerWhileTransition(obj, true);

			stopInterval(obj);
		};


		/**
		 * Actions after transition
		 * @param obj
		 */
		var restartActionsAfterTransition = function(obj) {

			inTransition = false;

			hiddenButtonsWhileTransition(obj, false);
			hiddenPagerWhileTransition(obj, false);

			startInterval(obj);
			addIntervalAnimation(obj);
		};


		// tabs handler
		tabHandler(slider);

		// css handler
		sliderHandler(slider);

		// adds the numbers to images according its position
		addNumbersToImages(slider);

		// checks the number of images and select the first it
		var numSliderImages = slider.find("img").length;
		var currentImage = settings.randomFront ? (Math.floor(Math.random() * numSliderImages) + 1) : 1;

		// adds the buttons to slider
		addButtons(slider);

		// adds the caption
		addCaption(slider, currentImage);

		// animate generic class
		var animateClass = 'animate-slider-' + settings.animation + '-';

		// shows the first image
		getImageDOM(slider, currentImage).css('display', 'block');

		// adds filter
		addFilter(slider);

		// adds pager
		addPager(slider, numSliderImages);
		addPagerSelected(slider, currentImage);

		// handles the automatic reproduction
		addInterval(slider);
		startInterval(slider);
		addIntervalAnimation(slider);

		// add click events
		slider.find(".buttons > a, .pager > div").click(function() {

			// check which entity has clicked
			var tagName = $(this).prop("tagName");
			var fromButton = tagName === 'A';
			var fromPager = tagName === 'DIV';

			// creates a pager object
			var pagerItem = fromPager ? $(this) : null;

			// checks if there is a transition or not
			if (!inTransition) {

				addActionsBeforeTransition(slider);

				// adds pager animation direction
				if (fromPager && pagerItem) {

					if (pagerItem.data('number') > currentImage) {
						pagerItem.data('direction', 'right');

					} else if (pagerItem.data('number') < currentImage){
						pagerItem.data('direction', 'left');

					} else {

						restartActionsAfterTransition(slider);

						return false;
					}
				}

				// gets the animation directions
				var directions = getDirections(this);

				// animates the current image
				getImageDOM(slider, currentImage).addClass(animateClass + directions.x);
				addDurationEffects(animateClass, settings.timeEffect);

				// removes the image caption
				removeCaption(slider, currentImage, directions.y);

				// animation timeout of current image
				setTimeout(function() {

					// stops the animation of the current image and hide it
					getImageDOM(slider, currentImage).removeClass(animateClass + directions.x).css('display', 'none');

					// computes the next image depending which is the current it
					if (fromButton) {
						currentImage = directions.x === 'right' ? (++currentImage > numSliderImages ? 1 : currentImage) : (--currentImage < 1 ? numSliderImages : currentImage);
					} else if (fromPager && pagerItem) {
						currentImage = pagerItem.data('number');
					}

					// selects pager's item
					addPagerSelected(slider, currentImage);

					// animates the current image
					getImageDOM(slider, currentImage).css('display', 'block').addClass(animateClass + directions.y);
					addDurationEffects(animateClass, settings.timeEffect);

					// prepare the next caption
					changeCaption(slider, currentImage);

					// next animation timeout
					setTimeout(function() {

						// stops the animation
						getImageDOM(slider, currentImage).removeClass(animateClass + directions.y);
						restartActionsAfterTransition(slider);

					}, settings.timeEffect);

				}, settings.timeEffect);
			}
		});


		/**
		 * Checks the customized types user's values
		 * @returns {boolean}
		 */
		function checkValues() {

			try {

				if (typeof settings.width !== "string") throw "'width' must be a string!";
				if (typeof settings.randomFront !== "boolean") throw "'randomFront' must be a boolean!";
				if (typeof settings.timeEffect !== "number") throw "'timeEffect' must be an integer!";
				if (typeof settings.animation !== "string") throw "'animation' must be a string!";
				if (typeof settings.overflowHidden !== "boolean") throw "'overflowHidden' must be a boolean!";
				if (typeof settings.borderSize !== "number") throw "'borderSize' must be an integer!";
				if (typeof settings.borderColor !== "string") throw "'borderColor' must be a string!";
				if (typeof settings.borderRadius !== "number") throw "'borderRadius' must be an integer!";
				if (typeof settings.paddingSize !== "number") throw "'paddingSize' must be an integer!";
				if (typeof settings.paddingColor !== "string") throw "'paddingColor' must be a string!";
				if (typeof settings.buttonsHiddenEffect !== "boolean") throw "'buttonsHiddenEffect' must be a boolean!";
				if (typeof settings.boomerang !== "boolean") throw "'boomerang' must be a boolean!";
				if (typeof settings.filter !== "string") throw "'filter' must be a string!";
				if (typeof settings.showPager !== "boolean") throw "'showPager' must be a boolean!";
				if (typeof settings.autoplay !== "boolean") throw "'autoplay' must be a boolean!";
				if (typeof settings.autoplayInterval !== "number") throw "'autoplayInterval' must be an integer!";
				if (typeof settings.shadowSize !== "number") throw "'shadowSize' must be an integer!";
				if (typeof settings.shadowColor !== "string") throw "'shadowColor' must be a string!";

				if (typeof settings.caption.animation !== "string") throw "'caption.animation' must be a string!";
				if (typeof settings.caption.position !== "string") throw "'caption.position' must be a string!";
				if (typeof settings.caption.float !== "string") throw "'caption.float' must be a string!";
				if (typeof settings.caption.backgroundColor !== "string") throw "'caption.backgroundColor' must be a string!";
				if (typeof settings.caption.borderSize !== "number") throw "'caption.borderSize' must be an integer!";
				if (typeof settings.caption.borderColor !== "string") throw "'caption.borderColor' must be a string!";
				if (typeof settings.caption.borderRadius !== "number") throw "'caption.borderRadius' must be an integer!";
				if (typeof settings.caption.fontColor !== "string") throw "'caption.fontColor' must be a string!";
				if (typeof settings.caption.fontSize !== "number") throw "'caption.fontSize' must be an integer!";
				if (typeof settings.caption.fontBold !== "boolean") throw "'caption.fontBold' must be a boolean!";
				if (typeof settings.caption.fontItalic !== "boolean") throw "'caption.fontItalic' must be a boolean!";
				if (typeof settings.caption.shadowSize !== "number") throw "'caption.shadowSize' must be an integer!";
				if (typeof settings.caption.shadowColor !== "string") throw "'caption.shadowColor' must be a string!";

				if (typeof settings.pager.dark !== "boolean") throw "'pager.dark' must be a boolean!";
				if (typeof settings.pager.transitionHidden !== "boolean") throw "'pager.transitionHidden' must be a boolean!";
				if (typeof settings.pager.float !== "string") throw "'pager.float' must be a string!";
				if (typeof settings.pager.position !== "string") throw "'pager.position' must be a string!";
				if (typeof settings.pager.background !== "string") throw "'pager.background' must be a string!";

			} catch (error) {

				alert ("SV-Slider Error:: " + error);
				return false;
			}

			return true;
		}
	};

} (jQuery));
