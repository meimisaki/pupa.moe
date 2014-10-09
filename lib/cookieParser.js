'use strict';

module.exports = function (params) {
	params = params || {};
	var seperator = params.seperator || /[;,]\s*/;
	var decode = params.decode || decodeURIComponent;
	return function (req, res, next) {
		if (req.parsedCookie) return next();
		var obj = req.parsedCookie = {};
		if (!req.headers.cookie) return next();
		req.headers.cookie.split(seperator).forEach(function (pair) {
			var index = pair.indexOf('=');
			if (index < 0) return ;
			var key = pair.slice(0, index).trim();
			var val = pair.slice(++index).trim();
			if (val[0] == '"') val = val.slice(1, -1);
			if (obj[key] == undefined) obj[key] = decode(val);
		});
		next();
	};
};
