'use strict';

var RE = /[&<>'"]/g;

var meta = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'\'': '&#39;', // don't use apos in html
	'"': '&quot;'
};

function escapeHTML(str) {
	if (typeof str != 'string') return str;
	return RE.test(str) ? str.replace(RE, function (ch) {
		return meta[ch];
	}) : str;
}

module.exports = escapeHTML;
