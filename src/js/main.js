$(function () {
	/**********************/
	/** IFRAME src stuff **/

	// Init
	var $webpreview = $('#webpreview');
	var $select = $('#iframe-url');

	if (ResponsiViewer === 'undefined' || typeof ResponsiViewer.files !== 'object' || ResponsiViewer.files.length === 'undefined' || ResponsiViewer.files.length === 0) {
		throw Error('Files names need to be set up in responsiviewer.js!');
	}
	else {
		var l = ResponsiViewer.files.length;
		var opt = "";

		for(var i = 0; i < l; i++) {
			opt += "<option value=" + ResponsiViewer.files[i].url + ">" + ResponsiViewer.files[i].name + "</option>";
		}
		$select
			.empty()
			.append($(opt));

		// TODO: set default selected option from url
	}

	var titlePrefix = ResponsiViewer.options && ResponsiViewer.options.titlePrefix || '';

	var iframeWithHistory = new iframeHistory('#webpreview > iframe', '#iframe-url', titlePrefix);


	/**********************/
	/** Fullscreen stuff **/
	var $fullscreen = $('#ResponsiViewer');
	var pfx = ["webkit", "moz", "ms", "o", ""];
	function RunPrefixMethod(obj, method) {
		var p = 0, m, t;
		while (p < pfx.length && !obj[m]) {
			m = method;
			if (pfx[p] == "") {
				m = m.substr(0,1).toLowerCase() + m.substr(1);
			}
			m = pfx[p] + m;
			t = typeof obj[m];
			if (t != "undefined") {
				pfx = [pfx[p]];
				return (t == "function" ? obj[m]() : obj[m]);
			}
			p++;
		}
	}

	$('#toggle-fullscreen').on('click', function(e) {
		e.preventDefault();

		if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
			RunPrefixMethod(document, "CancelFullScreen");
			$(this).removeClass('fullscreen-active');
		}
		else {
			RunPrefixMethod($fullscreen[0], "RequestFullScreen");
			$(this).addClass('fullscreen-active');
		}

		// TODO: recalculate iframe dimenstions
	});

	/********************/
	/** Resizing stuff **/

	/**
	 * Resize iframe
	 * @param width
	 * @param height
	 */
	function resize(width, height) {
		var params = {};

		if (! preserveHeight) {
			height = '100%';
		}

		var baseWidth = (width === '100%') ? null : width + scrollbarWidth;
		var baseHeight = (height === '100%') ? null : height;

		params = calculateZoom(baseWidth, baseHeight);

		setZoom(params.zoom);

		iframeWithHistory.$iframe.css({
			'width': params.width,
			'height': params.height
		});
	}


	/**
	 * Calculates necessary zoom if width or height is higher that available
	 * @param width
	 * @param height
	 * @returns {number}
	 */
	function calculateZoom(width, height) {
		var zoom = 1;

		// if (width === '100%') width = 1;
		// if (height === '100%') height = 1;

		var availableWidth = $webpreview.width();
		var availableHeight = $webpreview.height();

		zoom = Math.min(availableWidth / width, availableHeight / height, 1);

		if (zoom < 1 && (width === null || height === null)) {
			if (width !== null && height === null) {
				height = availableHeight / zoom;
			}
			if (width === null && height !== null) {
				width = availableWidth / zoom;
			}
		}

		return {
			zoom: zoom,
			width: width ? width : '100%',
			height: height ? height : '100%'
		};
	}


	/**
	 * Set zoom of preview
	 * @param zoom
	 */
	function setZoom(zoom) {
		iframeWithHistory.$iframe.css({
			'-webkit-transform': 'scale(' + zoom + ')',
			'-moz-transform': 'scale(' + zoom + ')',
			'-ms-transform': 'scale(' + zoom + ')',
			'-o-transform': 'scale(' + zoom + ')',
			'transform': 'scale(' + zoom + ')'
		});
	}


	/**
	 * Calculates the width of scrollbars
	 * @returns {number}
	 */
	function getScrollBarWidth () {
		var inner = document.createElement('p');
		inner.style.width = "100%";
		inner.style.height = "200px";

		var outer = document.createElement('div');
		outer.style.position = "absolute";
		outer.style.top = "0px";
		outer.style.left = "0px";
		outer.style.visibility = "hidden";
		outer.style.width = "200px";
		outer.style.height = "150px";
		outer.style.overflow = "hidden";
		outer.appendChild (inner);

		document.body.appendChild (outer);
		var w1 = inner.offsetWidth;
		outer.style.overflow = 'scroll';
		var w2 = inner.offsetWidth;
		if (w1 == w2) w2 = outer.clientWidth;

		document.body.removeChild (outer);

		return (w1 - w2);
	}


	// EVENT HANDLERS
	var $toolbar = $('#toolbar');
	var $device = $toolbar.find(':radio');

	var $width = $('#width');
	var $height = $('#height');

	var scrollbarWidth = getScrollBarWidth();
	var preserveHeight = true;

	$device.on('change', function() {
		var width = $(this).data('width');
		var height = $(this).data('height');

		if ($(this).attr('id') === 'device-custom') {
			$width.focus();

			width = parseInt($width.val()) || '100%';
			height = parseInt($height.val()) || '100%';
		}

		resize(width, height);
	});


	$('#preserveHeight')
		.on('change', function() {
			preserveHeight = $(this).prop('checked');

			$device.filter(':checked').trigger('change');
		})
		.triggerHandler('change');


	$width.add($height).on('change', function() {
		$device.filter('#device-custom')
			.prop('checked', true)
			.triggerHandler('change');
	});

	// TODO: on window resize, recalculate iframe dimensions

	$('#loader').fadeOut(function() {
		$(this).remove();
	});
});
