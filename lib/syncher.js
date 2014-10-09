'use strict';

function once(fn) {
	var called = false;
	return function () {
		if (called) return ;
		called = true;
		fn.apply(this, arguments);
	};
}

function Syncher() {
	this.asyncs = [];
}

Syncher.prototype = {
	constructor: Syncher,
	run: function (callback) {
		var cnt = this.asyncs.length;
		if (!cnt) {
			typeof callback == 'function' && callback();
			return this;
		}
		var args = new Array(cnt);
		this.asyncs.forEach(function (fn, key) {
			fn(once(function () {
				args[key] = arguments;
				!--cnt && typeof callback == 'function' && callback.apply(null, args);
			}));
		});
		return this;
	},
	add: function () {
		Array.prototype.push.apply(this.asyncs, arguments);
		return this;
	}
};

module.exports = Syncher;
