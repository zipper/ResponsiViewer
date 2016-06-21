$(function () {
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

		$iframe.css({
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

		console.log(availableWidth / width);
		console.log(availableHeight / height);

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
		$iframe.css({
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
	var $webpreview = $('#webpreview');
	var $iframe = $webpreview.find('> iframe');

	var $toolbar = $('#toolbar');
	var $li = $toolbar.find('li');
	var $device = $toolbar.find(':radio');

	var scrollbarWidth = getScrollBarWidth();
	var preserveHeight = true;

	$device.on('change', function() {
		var width = $(this).data('width');
		var height = $(this).data('height');

		if ($(this).attr('id') === 'device-custom') {
			width = parseInt($('#width').val()) || '100%';
			height = parseInt($('#height').val()) || '100%';
		}

		resize(width, height);
	});


	$('#preserveHeight')
		.on('change', function() {
			preserveHeight = $(this).prop('checked');

			$device.filter(':checked').trigger('change');
		})
		.triggerHandler('change');


	$('#width, #height').on('change', function() {
		$device.filter('#device-custom')
			.prop('checked', true)
			.triggerHandler('change');
	});
});
