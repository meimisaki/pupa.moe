'use strict';

var fs = require('fs');
var formidable = require('formidable');

var each = require('./each');

function pass() {}

// remove temporary files
function cleanup() {
	each(this, function (val, key) {
		fs.unlink(val.path, pass);
	});
}

module.exports = function (params) {
	params = params || {};
	var encoding = params.encoding || 'utf-8';
	var maxLength = params.maxLength || 2 * 1024 * 1024;
	return function (req, res, next) {
		if (req.form) return next();
		var form = new formidable.IncomingForm();
		form.encoding = encoding;
		form.maxFieldsSize = maxLength;
		form.parse(req, function (err, fields, files) {
			if (err) {
				cleanup.call(files);
				return req.connection.destroy();
			}
			req.form = {fields: fields, files: files};
			res.on('finish', cleanup.bind(files));
			next();
		});
	};
};
