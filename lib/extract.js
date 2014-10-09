'use strict';

var each = require('./each');

function extract(obj, fields) {
	var out = {};
	obj && each(fields, function (val, key) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) return ;
		out[key] = val && typeof val == 'object' ? extract(obj[key], val) : obj[key];
	});
	return out;
}

module.exports = extract;
