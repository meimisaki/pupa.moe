'use strict';

var each = require('./each');

function inspect(obj, fields, out, optional) {
	each(fields, function (ins, key) {
		if (!Object.prototype.hasOwnProperty.call(obj, key)) {
			if (optional) return ;
			return out.push('Please specify field ' + key);
		}
		var val = obj[key];
		switch (typeof ins) {
		case 'function':
			if (!ins.call(obj, val, key)) out.push('Field ' + key + ' error');
			break;
		case 'string':
			if (typeof val != ins) out.push('Field ' + key + ' requires type ' + ins);
			break;
		case 'number':
			val = obj[key] = parseFloat(val);
			if (val < 0 || val > ins) out.push('Field ' + key + ' is out of bound');
			break;
		case 'object':
			if (ins instanceof RegExp) {
				ins.lastIndex = 0;
				if (!ins.test(val)) out.push('Field ' + key + ' value is invalid');
			}
			else inspect(val, ins, out, optional);
			break;
		}
	});
}

function inspectObject(obj, required, optional) {
	var out = [];
	inspect(obj, required, out, false);
	inspect(obj, optional, out, true);
	return out.length ? out : null;
}

module.exports = inspectObject;
