'use strict';

var db = require('./db');
var cookieParser = require('./cookieParser')();

module.exports = function (params) {
	params = params || {};
	var id = params.id || 'admin';
	return function (req, res, next) {
		if (req.user) return next();
		cookieParser(req, res, function () {
			var client = db();
			client.getUser(id, function (err, user) {
				client.release();
				if (err) return res.die();
				req.user = user;
				req.verified = !!(user.token && user.token === req.parsedCookie.token);
				next();
			});
		});
	};
};
