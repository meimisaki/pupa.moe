'use strict';

function noop(req, res, next) {
	next();
}

module.exports = noop;
