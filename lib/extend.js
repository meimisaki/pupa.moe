'use strict';

var each = require('./each');

function extend(dst) {
	dst && each(arguments, function (src) {
		src !== dst && each(src, function (val, key) {
			dst[key] = val;
		});
	});
	return dst;
}

module.exports = extend;
