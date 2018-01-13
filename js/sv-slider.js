/*
 * Funció auto-executable sobreescrivint '$' per no interferir amb altres
 * llibreries de JavaScript, si n'hi hagués
 */
(function($) {

	// creació del plugin
	$.fn.slider = function(settings) {

		// constants
		var CAPTION_MARGIN = 15;
		var BUTTONS_SIZE = 15;

		// globals
		var interval;						// interval jQuery object
		var browser = $(window);			// browser object
		var slider = $(this);				// slider DOM object
		var settings = init(settings);		// get custom setting
		var inTransition = false;			// indicates if there is a transition

		/**
		 * Inicialitza la configuració
		 */
		function init (settings) {

			var settings = $.extend(true, {

	        	width: "100%",					// string
	            randomFront: false,				// bool
	            timeEffect: 400,				// int
	            animation: 'rotation',			// string :: options { rotation, translation, vibration, zoom }
	            overflowHidden: true,			// bool
	            borderSize: 1,					// int
	            borderColor: "#999",			// string
	            borderRadius: 0,				// int
	            paddingSize: 6,					// int:: max 50
	            paddingColor: "transparent",	// string
	            buttonsHiddenEffect: false,		// bool
	            boomerang: true,				// bool
	            filter: "off",					// string :: options { white, black, green, blue, red, magenta, yellow, cyan, gray }
	            showPager: true,				// boolean
	            autoplay: true,					// boolean
	            autoplayInterval: 6000,			// int

	            caption: {

	            	animation: "slide",							// string :: options { slide, fade }
	            	float: "left",								// string :: options { left, right }
	            	position: "bottom",							// string :: options { top, bottom }
		        	backgroundColor: "rgba(0, 5, 10, 0.6)",		// string
		        	borderSize: 0,								// int
		        	borderColor: "#FFF",						// string
		        	borderRadius: 0,							// int
		        	fontColor: "#FFF",							// string
		        	fontSize: 25,								// int
		        	fontBold: false,							// bool
		        	fontItalic: false,							// bool

		        },

		        pager: {
		        	dark: false,
		        	transitionHidden: true,			// bool
		        	float: "center",				// string:: options { left, right, center }
		        	position: "bottom",				// string:: options { top, bottom }
		        	background: "off"
		        },
		            
	        }, settings);

	        return settings;
		        
		}

		/**
		 * Obté les direccions d'animació
		 */
		var getDirections = function(obj) {

			var x = $(obj).data('direction') == 'left' ? 'left' : 'right';
			var y = $(obj).data('direction') == 'right' ? 'left' : 'right';

			return {x: x, y: settings.boomerang ? y : x};
		};

		/**
		 * S'actualitza el temps a l'efecte
		 */
		var addDurationEffects = function(str, time) {
			if (str.toString().indexOf('vibration') === -1) {
				$('.' + str + 'left').css('animation-duration', time + 'ms');
				$('.' + str + 'right').css('animation-duration', time + 'ms');
			}
		};

		/**
		 * Manipula el css
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
		};

		/**
		 * Manipula l'efecte dels botons
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
		 * Manipula l'efecte dels botons
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
		 * el número a les imatges segons el seu ordre
		 */
		var addNumbersToImages = function(obj) {
			obj.children('img').each(function(i, el) {
				$(el).attr('data-number', i + 1);
			});
		};

		/**
		 * Retorna una imatge del DOM segons el seu número
		 */
		var getImageDOM = function (obj, number) {
			return obj.find("img[data-number='" + number + "']");
		};


		/**
		 * Afegeix els botons a l'slider
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
		 * Afegeix les captures de text
		 */
		var addCaption = function(obj, currentImage) {

			var html = '<div class="caption"></div>';
			$(html).insertAfter(obj.find(".buttons"));

			// afegeix el CSS personalitzat
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

			// activa la primera caption
			changeCaption(slider, currentImage);
		};

		/**
		 * Canvia el text de les captures
		 */
		var changeCaption = function(obj, number, direction) {

			// si no arriba direcció, s'asigna a l'esquerra per defecte
			direction = direction === undefined ? "left" : direction;

			var text = getImageDOM(obj, number).data('caption');
			var caption = obj.find('.caption');

			// només s'esenya la caption si l'usuari hi ha afegit text
			if (text !== undefined && text !== "") {

				if (settings.caption.animation === "fade") {

					caption.fadeIn();

				} else if (settings.caption.animation === "slide") {
					
					if (settings.caption.float === 'left') {
						caption.show().animate({'left': (CAPTION_MARGIN + settings.paddingSize).toString() + 'px'}, settings.timeEffect);

					} else {
						caption.show().animate({'right': (CAPTION_MARGIN + settings.paddingSize).toString() + 'px'}, settings.timeEffect);
	
					}
				}

				caption.html(text);

			} else {
				obj.find('.caption').hide();
			}
		};

		/**
		 * Canvia el text de les captures
		 */
		var removeCaption = function(obj, number, direction) {

			// si no arriba direcció, s'asigna a l'esquerra per defecte
			direction = direction === undefined ? "left" : direction;

			var caption = obj.find('.caption');

			// si l'efecte és 'fade' només cal amagar la caption
			if (settings.caption.animation === "fade") {
				caption.fadeOut();

			// si l'efecte és 'slide' es dóna animació a la caption
			} else if (settings.caption.animation === "slide") {

				// el recorregut és l'amplada de tot l'slider menys l'amplada de la caption
				var distance = obj.width() - caption.width() - (settings.paddingSize * 2 + CAPTION_MARGIN * 2);

				// es té en compte la posició de la caption
				if (settings.caption.float === 'left') {
					
					// es té en compte la direcció d'animació
					if (direction == 'left') {
						caption.animate({'left': -distance  + 'px'}, settings.timeEffect, function() {
							caption.css('left', distance + 'px');
						});
					}
					else {
						caption.animate({'left': distance + 'px'}, settings.timeEffect, function() {
							caption.css('left', -distance + 'px');
						});
					}

				// es té en compte la posició de la caption
				} else {
					
					// es té en compte la direcció d'animació
					if (direction == 'left') {
						caption.animate({'right': distance + 'px'}, settings.timeEffect, function() {
							caption.css('right', -distance + 'px');
						});
					}
					else {
						caption.animate({'right': -distance + 'px'}, settings.timeEffect, function() {
							caption.css('right', distance + 'px');
						});
					}
				}
			}
		};

		/**
		 * Afegeix unfiltre
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
		 * Retorna un filtre segons la clau
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
		 * Afegeix el paginador
		 */
		var addPager =  function(obj, numImages) {

			var html = '<div class="pager"></div>';
			
			// s'insereix l'html
			$(html).insertAfter(obj.find('.filter'));
			var pager = obj.find('.pager');

			// s'adjunten les dades al div
			for (var i = 0; i < numImages; i++) {
				var direction = (i + 1) < numImages / 2 ? 'left' : 'right';
				pager.append('<div data-number="' + (i + 1) + '"></div>');
			}

			var left;

			// horitzontal del paginador
			if (settings.pager.float === 'center') left = (obj.width() / 2 - (pager.width() / 2)) + settings.paddingSize;
			else if (settings.pager.float === 'left') left = settings.paddingSize + CAPTION_MARGIN;
			else if (settings.pager.float === 'right') left = obj.width() - pager.width() + settings.paddingSize - CAPTION_MARGIN;

			// css bàsic del paginador
			pager.css({
				'width': 'auto',
				'left': left + 'px'
			});

			// posició del paginador
			if (settings.pager.position === 'top') {
				pager.css('top', 20 + settings.paddingSize + "px");

			} else {
				pager.css('bottom', 20 + settings.paddingSize + "px");
			}

			// es treu el marge a l'últim fill
			pager.find('div:last-child').css('margin', 0);

			// es té en compte el color del paginador
			if (settings.pager.dark) {
				pager.addClass('dark');
			}

			// es té en compte si hi ha fons i el seu color
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
		 * Selecciona la imatge del paginador
		 */
		var addPagerSelected = function(obj, number) {
			obj.find('div').removeClass('selected'),
			obj.find("div[data-number='" + number + "']").addClass('selected');
		};

		/**
		 * Afegeix l'html per l'interval
		 */
		var addInterval = function(obj) {

			if (settings.autoplay) {
				$('<div class="interval-bar"></div>').insertAfter(obj.find('.pager'));
				obj.find('.interval-bar').css('bottom', settings.paddingSize);
			}
		};

		var addIntervalAnimation = function(obj) {
			if (settings.autoplay) {
				obj.find('.interval-bar').css('width', '0').show().stop(true).animate({'width': obj.width() + 'px'}, settings.autoplayInterval, 'swing');
			}
		};

		/**
		 * Acciona la reproducció automàtica
		 */
		var startInterval = function(obj) {

			if (settings.autoplay) {
				interval = setInterval(intervalHandler, settings.autoplayInterval, obj);
			}
		};

		/**
		 * Assigna esdeveniment a l'interval de reproducció automàtica
		 */
		var intervalHandler = function(obj) {

			if (settings.autoplay) {
				obj.find('.buttons > a.right').trigger('click');
			}
		};

		/**
		 * Atura la reproducció automàtica
		 */
		var stopInterval = function(obj) {

			if (settings.autoplay) {
				clearInterval(interval);
				obj.find('.interval-bar').hide();
			}
		};

		/**
		 * Manipulador de pestanyes
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
		 * Accions abans de la transició
		 */
		var addActionsBeforeTransition = function(obj) {

			inTransition = true;

			// s'amaguen els botons si escau
			hiddenButtonsWhileTransition(obj, true);
			hiddenPagerWhileTransition(obj, true);

			// manipula la reproducció automàtica
			stopInterval(obj);
		};

		/**
		 * Accions després de la transició
		 */
		var restartActionsAfterTransition = function(obj) {

			inTransition = false;

			// es mostren els botons si estaven amagats
			hiddenButtonsWhileTransition(obj, false)
			hiddenPagerWhileTransition(obj, false);

			// manipula la reproducció automàtica
			startInterval(obj);
			addIntervalAnimation(obj);
		};


		/*************** Slider ****************/

		
		// es comproven els tipus
		checkValues();

        // manipulador de pestanyes
        tabHandler(slider);

        // manipula el css de l'slider
        sliderHandler(slider);

        // s'afegeix el número a les imatges segons el seu ordre
		addNumbersToImages(slider);

		// es detecta el nombre d'imatges i es selecciona una imatge a l'atzar per començar
		var numSliderImages = slider.find("img").length;
		var currentImage = settings.randomFront ? (Math.floor(Math.random() * numSliderImages) + 1) : 1;

		// afegeix els botons a l'slider (després de comptar les imatges!)
		addButtons(slider);

		// s'afegeix la captura
		addCaption(slider, currentImage);

		// classe d'animació genèrica
		var animateClass = 'animate-slider-' + settings.animation + '-';

		// es mostra la primera imatge
		getImageDOM(slider, currentImage).css('display', 'block');

		// Afegeix un filtre si cal
		addFilter(slider);

		// afegeix el paginador
		addPager(slider, numSliderImages);
		addPagerSelected(slider, currentImage);

		// manipula la reproducció automàtica
		addInterval(slider);
		startInterval(slider);
		addIntervalAnimation(slider);

		// s'assignen les funcions del 'click' als botons
		slider.find(".buttons > a, .pager > div").click(function() {

			// es compova de quina entitat prové el click
			var tagName = $(this).prop("tagName");
			var fromButton = tagName === 'A';
			var fromPager = tagName === 'DIV';

			// es crea un objecte de paginador
			var pagerItem = fromPager ? $(this) : null;

			// si els botons estan actius
			if (!inTransition) {

				// accions abans de la transició
				addActionsBeforeTransition(slider);

				// si s'arriba del paginador cal mirar en quina direcció anar
				if (fromPager && pagerItem) {

					if (pagerItem.data('number') > currentImage) {
						pagerItem.data('direction', 'right');

					} else if (pagerItem.data('number') < currentImage){
						pagerItem.data('direction', 'left');

					} else {

						// accions després de la transició
						restartActionsAfterTransition(slider);

						return false;
					}
				}

				// obté les direccions d'animació
				var directions = getDirections(this);

				// s'anima la imatge actual
				getImageDOM(slider, currentImage).addClass(animateClass + directions.x);
				addDurationEffects(animateClass, settings.timeEffect);

				//es canvia la caption
				removeCaption(slider, currentImage, directions.y);
				
				// timeout d'animació de la imatge actual
				setTimeout(function() {

					// s'atura l'animació de la imatge actual i s'amaga la imatge
					getImageDOM(slider, currentImage).removeClass(animateClass + directions.x).css('display', 'none');

					// es calcula la propera imatge segons l'actual
					if (fromButton) {
						currentImage = directions.x === 'right' ? (++currentImage > numSliderImages ? 1 : currentImage) : (--currentImage < 1 ? numSliderImages : currentImage);
					} else if (fromPager && pagerItem) {
						currentImage = pagerItem.data('number');
					}

					// se selecciona l'ítem corresponent
					addPagerSelected(slider, currentImage);

					// s'anima la imatge següent
					getImageDOM(slider, currentImage).css('display', 'block').addClass(animateClass + directions.y);
					addDurationEffects(animateClass, settings.timeEffect);

					//es canvia la caption
					changeCaption(slider, currentImage, directions.y);

					// timeout de rotació de la segona imatge
					setTimeout(function() {

						// s'atura l'animació de la segona imatge
						getImageDOM(slider, currentImage).removeClass(animateClass + directions.y);

						// accions després de la transició
						restartActionsAfterTransition(slider);

					}, settings.timeEffect);
					
				}, settings.timeEffect);
			}
		});

		/**
		 * Es comprova que els tipus dels valors entrats siguin correctes
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

				if (typeof settings.pager.dark !== "boolean") throw "'pager.dark' must be a boolean!";
				if (typeof settings.pager.transitionHidden !== "boolean") throw "'pager.transitionHidden' must be a boolean!";
				if (typeof settings.pager.float !== "string") throw "'pager.float' must be a string!";
				if (typeof settings.pager.position !== "string") throw "'pager.position' must be a string!";
				if (typeof settings.pager.background !== "string") throw "'pager.background' must be a string!";


			} catch (error) {
				alert ("SV-Slider Error:: " + error);
			}
		}
	};

} (jQuery));

