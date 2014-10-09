'use strict';

var domain = require('domain');

module.exports = function (fn) {
	if (typeof fn != 'function') throw new Error('error handler expect type function');
	return function (req, res, next) {
		var dom = domain.create();
		dom.on('error', function (err) {
			fn(err, req, res, next);
			dom.dispose();
		});
		dom.add(req);
		dom.add(res);
		dom.run(next);
	};
};
