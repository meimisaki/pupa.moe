'use strict';

var Dispatcher = require('./dispatcher');
var Heap = require('./heap');

var extend = require('./extend');

function sizeof(obj) {
	return obj && obj.length || 1;
}

// LRU Cache

function Cache(params) {
	params = params || {};
	this.sizeof = params.sizeof || sizeof;
	this.map = {};
	if (!(this.maxSize = params.maxSize)) return ;
	this.heap = new Heap();
	this.count = 0;
	this.size = 0;
}

Cache.prototype = extend(Object.create(Dispatcher.prototype), {
	constructor: Cache,
	set: function (key, val) {
		if (!this.maxSize) return this.map[key] = val;
		if (this.has(key)) this.remove(key);
		this.heap.push(key, this.count++);
		this.map[key] = val;
		this.size += this.sizeof(val);
		while (this.size > this.maxSize) {
			var key = this.heap.top();
			this.dispatchAsync({type: 'remove', name: key, data: this.remove(key)});
		}
		return val;
	},
	get: function (key) {
		if (!this.maxSize) return this.map[key];
		if (!this.has(key)) return ;
		this.heap.update(key, this.count++);
		return this.map[key];
	},
	has: function (key) {
		return Object.prototype.hasOwnProperty.call(this.map, key);
	},
	remove: function (key) {
		if (!this.has(key)) return ;
		var val = this.map[key];
		delete this.map[key];
		if (!this.maxSize) return val;
		this.heap.pop(key);
		this.size -= this.sizeof(val);
		return val;
	}
});

module.exports = Cache;
