'use strict';

var extend = require('./extend');

function camelCase(str) {
	return str.replace(/-([a-z])/ig, function (_, ch) {
		return ch.toUpperCase();
	});
}

var tokens = {};

function logger(req, res, next) {
	var fmt = this;
	function fn() {
		res.removeListener('finish', fn);
		res.removeListener('close', fn);
		console.log(fmt(tokens, req, res));
	}
	req.date = req.date || new Date();
	req.remoteAddr = req.socket.remoteAddress;
	res.on('finish', fn);
	res.on('close', fn);
	next();
}

function compile(fmt) {
	fmt = fmt.replace('"', '\\"');
	return new Function('tokens, req, res', 'return "' + fmt.replace(/:([\-\w]+)/g, function (_, name) {
		return '" + tokens["' + name + '"](req, res) + "';
	}) + '";');
}

function define(name, fn) {
	tokens[name] = fn;
	return this;
}

['method', 'url', 'date', 'remoet-addr'].forEach(function (val, key) {
	define(val, function (req, res) {
		return req[camelCase(val)];
	});
});

['status-code'].forEach(function (val, key) {
	define(val, function (req, res) {
		return res[camelCase(val)];
	});
});

define('response-time', function (req, res) {
	return +(res.date || (res.date = new Date())) - +req.date;
});

module.exports = extend(function (fmt) {
	return logger.bind(compile(fmt));
}, {
	define: define,
	camelCase: camelCase
});
