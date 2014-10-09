'use strict';

module.exports = function (name, val, opts) {
	opts = opts || {};
	var encode = opts.encode || encodeURIComponent;
	var pairs = [name + '=' + encode(val)];
	if (opts.maxAge) pairs.push('Max-Age=' + opts.maxAge);
	if (opts.domain) pairs.push('Domain=' + opts.domain);
	if (opts.path) pairs.push('Path=' + opts.path);
	if (opts.expires) pairs.push('Expires=' + opts.expires.toUTCString());
	if (opts.httpOnly) pairs.push('HttpOnly');
	if (opts.secure) pairs.push('Secure');
	return pairs.join('; ');
};
