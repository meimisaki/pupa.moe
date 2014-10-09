'use strict';

var extend = require('./extend');

function inherit(parent, extra) {
	return extend(new (extend(function () {}, {prototype: parent}))(), extra);
}

module.exports = inherit;
