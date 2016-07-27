/**
 * Changes iframe url and updates parent page title and url based on select value
 * @constructor
 * @param iframe
 * @param select
 * @param titlePrefix
 *
 * TODO: reload causes history loss, any ideas?
 */
var iframeHistory = function(iframe, select, titlePrefix) {
	this.$iframe = $(iframe);
	this.$select = $(select);

	this.titlePrefix = titlePrefix;

	var pathname = window.location.pathname;
	this.url = window.location.protocol + "//" + window.location.host + pathname.substring(0, pathname.lastIndexOf("/") + 1);

	this.popstateLoad = false;
	this.historySupported =  window.history && history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);

	var that = this;

	this.$iframe
		.on('load', function(e) {
			that.load.call(that, e);
		});

	this.$select
		.on('change init', function(e) {
			that.selectChange.call(that, e, this);
		})
		.triggerHandler('init');

	$(window).on('popstate', function(e) {
		that.popstate.call(that, e);
	})

};

/**
 * Reloads iframe URL (taken from select) without creating new history state
 * @param e
 * @param el
 */
iframeHistory.prototype.selectChange = function(e, el) {
	if (e.type === 'init') {
		$newIframe = this.$iframe.clone(true);
		$newIframe.attr('src', $(el).val());

		this.$iframe.replaceWith($newIframe);
		this.$iframe = $newIframe;
	}
	else {
		this.$iframe.attr('src', $(el).val());
	}

};

/**
 * Load callback for iframe. Creates or modifies state in browser history with custom state.
 * @param e
 */
iframeHistory.prototype.load = function(e) {
	var title = this.$iframe[0].contentDocument.title;

	if (title) {
		document.title = title = (this.titlePrefix ? this.titlePrefix : '') + title;

		if (this.historySupported) {
			var href = window.location.href.split('?')[0];
			var url = this.$iframe[0].contentDocument.URL;

			var fileName = url.split(this.url);
			if (fileName[1]) {
				fileName = fileName[1];
			}
			else {
				fileName = url; // if somehow absolute url is used (same origin policy?)
			}

			href += "?page=" + encodeURI(fileName);

			state = {
				iframeHistory: true,
				title: title,
				url: href,
				fileName: fileName
			};

			if (! this.popstateLoad) {
				window.history.replaceState(state, title, href);
			}
			else {
				this.popstateLoad = false; // reset to false
			}

			this.setSelectValue(fileName);
		}
	}
};

/**
 * Set value of select. If value doesn't exist, it temporary creates disabled option.
 * @param value
 */
iframeHistory.prototype.setSelectValue = function(value) {
	this.$select.val(value);

	// non-existing value
	if (value !== this.$select.val()) {
		this.$select
			.prepend("<option value=" + value + " data-unknown-file>Unknown file</option>")
			.val(value);
	}
	else {
		this.$select.find('option[data-unknown-file]').remove();
	}
};

/**
 * Handles document popstate event. Changes select value to according to popped file and triggers change handler.
 * @param e
 */
iframeHistory.prototype.popstate = function(e) {
	var state = e.originalEvent.state;

	if (state && state.iframeHistory) {
		this.popstateLoad = true;

		this.setSelectValue(state.fileName);
		this.$select.triggerHandler('change');
	}
};
