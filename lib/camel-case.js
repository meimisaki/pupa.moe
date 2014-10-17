'use strict';

function camelCase(str) {
	return str.replace(/-([a-z])/ig, function (_, ch) {
		return ch.toUpperCase();
	});
}

module.exports = camelCase;
