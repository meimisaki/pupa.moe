'use strict';

var fs = require('fs');
var path = require('path');

var Dispatcher = require('./dispatcher');
var Cache = require('./cache');
var Syncher = require('./syncher');

var extend = require('./extend');

function sizeof(pair) {
	return pair[0].length;
}

function remove(event) {
	this.watcher.remove(event.name).close();
}

function Loader(params) {
	params = params || {};
	extend(this, {
		pathname: params.pathname || '.',
		extname: params.extname ? '.' + params.extname : '',
		converter: params.converter,
		options: extend({encoding: 'utf-8'}, params.options),
		cache: new Cache({maxSize: params.maxSize, sizeof: sizeof}),
		watcher: new Cache(),
		queue: new Cache()
	});
	this.cache.on('remove', remove.bind(this));
}

Loader.prototype = extend(Object.create(Dispatcher.prototype), {
	constructor: Loader,
	_distrib: function (name, err, data, stat) {
		err || this._watch(name, data, stat);
		this.queue.remove(name).forEach(function (fn) {
			typeof fn == 'function' && fn(err, data, stat);
		});
	},
	_watch: function (name, data, stat) {
		this.cache.set(name, [data, stat]);
		this.watcher.has(name) || fs.watch(this._path(name), this.watcher.set(name, function (type, filename) {
			// cache removed internally
			// while remove-event not yet triggered
			if (!this.cache.has(name)) return ;
			switch (type) {
			case 'rename':
				if (!filename) break;
				var oldName = name;
				name = path.basename(filename, this.extname);
				this.watcher.set(name, this.watcher.remove(oldName));
				this.cache.set(name, this.cache.remove(oldName));
				this.dispatch({type: type, name: name, oldName: oldName});
				break;
			case 'change':
				this.cache.remove(name);
				this.load(name);
				this.dispatch({type: type, name: name});
				break;
			default:
				throw new Error('unrecognized file modification type: ' + type);
			}
		}.bind(this)));
	},
	_path: function (name) {
		return path.join(this.pathname, name + this.extname);
	},
	_push: function (name, fn) {
		if (this.queue.has(name)) return this.queue.get(name).push(fn) && false;
		return this.queue.set(name, [fn]) && true;
	},
	load: function (name, callback) {
		if (this.cache.has(name)) {
			if (typeof callback == 'function') {
				var args = this.cache.get(name);
				callback(null, args[0], args[1]);
			}
		}
		else if (this._push(name, callback)) {
			new Syncher().add(function (fn) {
				fs.readFile(this._path(name), this.options, fn);
			}.bind(this), function (fn) {
				fs.stat(this._path(name), fn);
			}.bind(this)).run(function (dataArgs, statArgs) {
				var err = dataArgs[0] || statArgs[0];
				var data = dataArgs[1];
				var stat = statArgs[1];
				if (err || typeof this.converter != 'function') return this._distrib(name, err, data, stat);
				this.converter({
					data: data,
					pathname: this._path(name)
				}, function (cvtErr, data) {
					this._distrib(name, err || cvtErr, data, stat);
				}.bind(this));
			}.bind(this));
		}
		return this;
	}
});

module.exports = Loader;
