'use strict';

var config = require('./config');

var domain = config.DOMAIN;

var caja = require('google-caja');

var allowed = {};

['http', 'https'].forEach(function (scheme) {
	allowed[scheme] = true;
});

var tagPolicy = caja.makeTagPolicy(function (uri, effect, ltype, hints) {
	switch (hints.XML_TAG) {
	case 'img':
		if (uri.hasScheme() && !allowed[uri.getScheme()] ||
			uri.hasDomain() && uri.getDomain() != domain ||
			uri.hasPort())
			break;
	case 'a':
		return uri;
	}
});

function sanitize(html) {
	return caja.sanitizeWithPolicy(html, tagPolicy);
}

module.exports = sanitize;
