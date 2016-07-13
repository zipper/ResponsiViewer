/**
 * Allows to change iframe's src using select with custom browser history state
 * @constructor
 * @param iframe
 * @param select
 */
var iframeHistory = function(iframe, select) {
	this.$iframe = $(iframe);
	this.$select = $(select);

	var pathname = window.location.pathname;
	this.url = window.location.protocol + "//" + window.location.host + pathname.substring(0, pathname.lastIndexOf("/") + 1);

	this.firstLoad = true;
	this.popstateLoad = false;
	this.selectLoad = false;

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
	if (e.type === 'change') {
		this.selectLoad = true;
	}

	$newIframe = this.$iframe.clone(true);
	$newIframe.attr('src', $(el).val());

	this.$iframe.replaceWith($newIframe);
	this.$iframe = $newIframe;
};

/**
 * Load callback for iframe. Creates or modifies state in browser history with custom state.
 * @param e
 */
iframeHistory.prototype.load = function(e) {
	console.log('iframe load');
	var title = this.$iframe[0].contentDocument.title;

	if (title) {
		document.title = title = 'ResponsiViewer | ' + title;

		if (this.historySupported) {
			var href = window.location.href.split('?')[0];
			var url = this.$iframe[0].contentDocument.URL;

			var fileName = url.split(this.url);
			if (fileName[1]) {
				fileName = fileName[1]
			}
			else {
				fileName = url; // if somehow absolute url is used (same origin policy?)
			}

			href += "?page=" + encodeURI(fileName);

			state = {
				ResponsiViewer: true,
				title: title,
				url: href,
				fileName: fileName
			};

			if (! this.popstateLoad) {
				// TODO: click on anchor inside iframe should remove the iframe and reload it again and push custom state; replace state can be used only in first load, because removing iframe removes the history
				// TODO: better way, let the iframe load and call only replaceState instead of pushState
				if (this.firstLoad || ! this.selectLoad) {
					this.firstLoad = false;
					window.history.replaceState(state, title, href);
				}
				else {
					window.history.pushState(state, title, href);
				}
				this.selectLoad = false;
			}
			else {
				this.popstateLoad = false;
			}

			if (this.popstateLoad || ! this.selectLoad) {
				this.setSelectValue(fileName);
			}
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

	if (state && state.ResponsiViewer) {
		this.popstateLoad = true;

		this.setSelectValue(state.fileName);
		this.$select.triggerHandler('change');
	}
};

/**
 * Sets parameter into document URL
 * @param parameter
 * @param value
 */
iframeHistory.prototype.setUrlParameter = function(parameter, value) {

};

/**
 * Reads parameter from document URL (not the iframe url)
 * @param parameter
 * @returns {*}
 */
iframeHistory.prototype.getUrlParameter = function(parameter) {
	var value;

	return value;
};
