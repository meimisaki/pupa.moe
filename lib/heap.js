'use strict';

function Heap() {
	this.keys = [];
	this.map = {};
	this.prior = {};
}

Heap.prototype = {
	constructor: Heap,
	empty: function () {
		return !this.keys.length;
	},
	top: function () {
		return this.keys[0];
	},
	pop: function (key) {
		var i;
		if (key === undefined) key = this.keys[i = 0];
		else i = this.map[key];
		delete this.map[key];
		delete this.prior[key];
		var last = this.keys.pop();
		if (i == this.keys.length) return key;
		this.keys[i] = last;
		this.map[last] = i;
		this._up(last);
		this._down(last);
		return key;
	},
	push: function (key, prior) {
		this.map[key] = this.keys.length;
		this.keys.push(key);
		this.prior[key] = prior;
		this._up(key);
	},
	update: function (key, prior) {
		this.prior[key] = prior;
		this._up(key);
		this._down(key);
	},
	priority: function (key) {
		return this.prior[key];
	},
	_swap: function (i, j) {
		var key1 = this.keys[i];
		var key2 = this.keys[j];
		this.map[key1] = j;
		this.map[key2] = i;
		this.keys[i] = key2;
		this.keys[j] = key1;
	},
	_up: function (key) {
		for (var i = this.map[key], j ; i ; i = j) {
			j = i - 1 >> 1;
			if (this.prior[this.keys[i]] < this.prior[this.keys[j]]) this._swap(i, j);
			else break;
		}
	},
	_down: function (key) {
		for (var i = this.map[key], j, k = this.keys.length ; (i << 1) + 1 < k ; i = j) {
			j = (i << 1) + 1;
			if (j + 1 < k && this.prior[this.keys[j + 1]] < this.prior[this.keys[j]]) ++j;
			if (this.prior[this.keys[j]] < this.prior[this.keys[i]]) this._swap(i, j);
			else break;
		}
	}
};

module.exports = Heap;
