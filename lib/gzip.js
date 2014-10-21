'use strict';

var zlib = require('zlib');

var mime = require('mime');

mime.default_type = mime.lookup('txt');

var encodings = ['gzip', 'deflate'];

module.exports = function (params) {
	params = params || {};
	var threshold = params.threshold || 1024;
	var RE = new RegExp('^(?:' + (params.types || []).join('|') + ')$', 'i');
	function gzip(req, res, next) {
		if (Object.prototype.hasOwnProperty.call(res, 'zippedData')) return next();
		gzip.detect(req, res);
		function finish(err, data) {
			res.zippedData = err ? '' : data;
			next();
		}
		var encoding = res.getHeader('content-encoding');
		if (encodings.indexOf(encoding) == -1) return finish(null, res.data);
		zlib[encoding](res.data, finish);
	}
	gzip.detect = function (req, res) {
		if (!res.data || !res.extname) return ;
		res.extname = res.extname.trim();
		res.setHeader('content-type', mime.lookup(res.extname));
		if (res.data.length < threshold) return ;
		RE.lastIndex = 0;
		if (!RE.test(res.extname)) return ;
		var acceptEncoding = req.headers['accept-encoding'] || '';
		for (var key = 0 ; key < encodings.length ; ++key)
			if (acceptEncoding.match(new RegExp('\\b' + encodings[key] + '\\b', 'i')))
				return res.setHeader('content-encoding', encodings[key]);
	};
	return gzip;
};
