'use strict';

var crypto = require('crypto');

function md5(val) {
	return crypto.createHash('md5').update(val, 'utf8').digest('hex');
}

module.exports = md5;
