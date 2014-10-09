'use strict';

function Dispatcher() {}

Dispatcher.prototype = {
	constructor: Dispatcher,
	_clearEventQueue: function () {
		this._eventQueue.splice(0, this._eventQueue.length).forEach(function (event) {
			this.dispatch(event);
		}, this);
	},
	dispatchAsync: function (event) {
		this._eventQueue || (this._eventQueue = []);
		this._eventQueue.push(event) == 1 && process.nextTick(this._clearEventQueue.bind(this));
		return this;
	},
	dispatch: function (event) {
		this._listeners && this._listeners[event.type] && this._listeners[event.type].forEach(function (fn) {
			typeof fn == 'function' && fn(event);
		});
		return this;
	},
	on: function () {
		var args = Array.prototype.slice.call(arguments);
		var type = args.shift();
		this._listeners || (this._listeners = {});
		this._listeners[type] || (this._listeners[type] = []);
		Array.prototype.push.apply(this._listeners[type], args);
		return this;
	}
}

module.exports = Dispatcher;
