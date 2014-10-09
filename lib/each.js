'use strict';

function isArrayLike(obj) {
	return obj && typeof obj.length == 'number' &&
	(typeof obj.hasOwnProperty != 'function' && typeof obj.constructor != 'function' ||
	Object.prototype.toString.call(obj) != '[object Object]' ||
	typeof obj.callee == 'function');
}

function each(obj, iter, ctx) {
	if (obj) {
		if (obj.forEach && obj.forEach !== each) {
			obj.forEach(iter, ctx);
		}
		else if (isArrayLike(obj)) {
			for (var key = 0 ; key < obj.length ; ++key)
				iter.call(ctx, obj[key], key);
		}
		else {
			for (var key in obj)
				if (Object.prototype.hasOwnProperty.call(obj, key))
					iter.call(ctx, obj[key], key);
		}
	}
	return obj;
}

module.exports = each;
