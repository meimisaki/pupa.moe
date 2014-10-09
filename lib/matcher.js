'use strict';

function Matcher(pattern) {
	pattern = pattern.trim();
	this.pattern = pattern.slice(-1) == '/' ? pattern.slice(0, -1) : pattern;
	var keys = this.keys = [];
	this.RE = new RegExp('^' + this.pattern
		.replace(/([\[\]\\\^\$\.\|\?\+\(\)])/g, '\\$1')
		.replace(/(\/?)(\*+)/g, function (_, slash, stars) {
			return slash + (stars.length > 1 ? '.*?' : '[^/]*');
		})
		.replace(/(\/?):(\w+)/g, function (_, slash, key) {
			keys.push(key);
			return slash + '([^/]*)';
		}) + '$', 'i');
}

Matcher.prototype = {
	constructor: Matcher,
	match: function (path) {
		this.RE.lastIndex = 0;
		var vals = this.RE.exec(path);
		if (!vals) return null;
		var obj = {}, keys = this.keys;
		vals.slice(1).forEach(function (val, key) {
			obj[keys[key]] = val;
		});
		return obj;
	}
};

function match(patterns, path) {
	for (var key = 0 ; key < patterns.length ; ++key)
		if (patterns[key].match(path))
			return true;
	return false;
}

Matcher.match = match;

module.exports = Matcher;
