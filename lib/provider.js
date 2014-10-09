'use strict';

var path = require('path');
var less = require('less');

var Loader = require('./loader');
var Cache = require('./cache');
var Matcher = require('./matcher');

var each = require('./each');
var noop = require('./noop');

var mime = require('mime');

var mappings = {};

mappings[mime.lookup('css')] = ['less'];

mime.define(mappings);

function converter(data, callback) {
	switch (path.extname(data.pathname).slice(1).toLowerCase()) {
	case 'less':
		return this.parser.parse(data.data.toString(), function (err, tree) {
			if (err) return callback(err);
			callback(null, tree.toCSS({compress: true}));
		});
	default:
		return callback(null, data.data);
	}
}

module.exports = function (params) {
	params = params || {};
	var pathname = params.pathname || '.';
	var parser = new less.Parser({
		paths: [path.join(pathname, 'styles')]
	});
	var loader = new Loader({
		pathname: pathname,
		converter: converter.bind({
			parser: parser
		}),
		options: {encoding: null},
		maxSize: params.CACHE_MAX_SIZE
	});
	var caches = {}, gzip = params.gzip || noop;
	loader.on('rename', function (event) {
		each(caches, function (cache) {
			cache.set(event.name, cache.remove(event.oldName));
		});
	}).on('change', function (event) {
		each(caches, function (cache) {
			cache.remove(event.name);
		});
	});
	var patterns = {
		PRIVATE: [],
		PUBLIC: []
	};
	each(patterns, function (val, key) {
		each(params[key + '_PATHS'], function (path) {
			val.push(new Matcher(path));
		});
	});
	return function (req, res, next) {
		if (Matcher.match(patterns.PRIVATE, req.pathname)) {
			res.statusCode = 403;
			return res.send();
		}
		if (!Matcher.match(patterns.PUBLIC, req.pathname)) return next();
		loader.load(req.pathname, function (err, data, stat) {
			if (err) {
				res.statusCode = 404;
				return res.send();
			}
			var lastModified = stat.mtime.toUTCString();
			if (req.headers['if-modified-since'] == lastModified) {
				res.statusCode = 304;
				return res.send();
			}
			res.setHeader('last-modified', lastModified);
			res.data = data;
			res.extname = path.extname(req.pathname).slice(1);
			gzip.detect && gzip.detect(req, res);
			var encoding = res.getHeader('content-encoding');
			var cache = null;
			if (encoding !== undefined) {
				cache = caches[encoding] = caches[encoding] || new Cache({maxSize: params.CACHE_MAX_SIZE});
			}
			if (cache && cache.has(req.pathname)) {
				res.zippedData = cache.get(req.pathname);
				return res.send();
			}
			gzip(req, res, function () {
				cache && cache.set(req.pathname, res.zippedData);
				res.send();
			});
		});
	};
};
