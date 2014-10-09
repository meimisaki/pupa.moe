'use strict';

var vm = require('vm');

var Loader = require('./loader');
var Cache = require('./cache');
var Syncher = require('./syncher');

var extend = require('./extend');
var inherit = require('./inherit');
var uuid = require('./uuid');

GLOBAL.escapeHTML = require('./escapeHTML');

function id() {
	return '_' + uuid().split('-').join('');
}

function defer(name, local) {
	var index = this.queue.length;
	this.queue.push(null);
	return function (callback) {
		this.renderer.render(name, inherit(this.scope, local), function (rendered) {
			this.queue[index] = rendered;
			callback();
		}.bind(this));
	}.bind(this);
}

function error() {
	Array.prototype.slice.call(arguments).pop()('renderer error');
}

/*

<% javascript code %>
<%= render text(encode contents) %>
<%@ render html %>
<%& import file | optional parameter object %>

*/

function compile(name, callback) {
	name = name.trim();
	if (this.cache.has(name)) return callback(this.cache.get(name));
	new Syncher().add(function (callback) {
		this.htmlLoader.load(name, callback);
	}.bind(this), function (callback) {
		this.jsLoader.load(name, callback);
	}.bind(this)).run(function (htmlArgs, jsArgs) {
		if (htmlArgs[0]) return callback(error);
		var html = htmlArgs[1];
		var local = jsArgs[0] ? null : jsArgs[1];
		var queueID = id();
		var deferID = id();
		var scopeID = id();
		var syncherID = id();
		var callbackID = id();
		var renderer = this;
		var body = queueID + '.push(\'' + html
			.replace(/[\r\t\n]/g, ' ')
			.split('<%').join('\t')
			.replace(/((?:^|%>)[^\t]*)'/g, '$1\r')
			.replace(/\t=(.*?)%>/g, '\',escapeHTML($1),\'')
			.replace(/\t@(.*?)%>/g, '\',$1,\'')
			.replace(/\t&(.*?)(?:\|(.*?))?%>/g, '\');' + syncherID + '.add(' + deferID + '.apply(null,[$1].concat([$2])));' + queueID + '.push(\'')
			.split('\t').join('\');')
			.split('%>').join(queueID + '.push(\'')
			.split('\r').join('\\\'') + '\');' + syncherID + '.run(function(){' + callbackID + '(' + queueID + '.join(\'\'))})';
		function fn(scope, local, callback) {
			var queue = [];
			scope = inherit(scope, local);
			var argsID = [queueID, deferID, scopeID, syncherID, callbackID];
			var args = [queue, defer.bind({
				renderer: renderer, queue: queue, scope: scope
			}), scope, new Syncher(), callback];
			for (var key in scope) {
				argsID.push(key);
				args.push(scope[key]);
			}
			try {
				new Function(argsID, body).apply(scope, args);
			}
			catch (err) {
				if (renderer.debugMode) console.error(err);
				error(callback);
			}
		}
		callback(this.cache.set(name, function () {
			var args = Array.prototype.slice.call(arguments);
			var callback = args.pop();
			var scope = args.shift();
			if (typeof local != 'function') return fn(scope, local, callback);
			local.call(scope, function (local) {
				fn(scope, local, callback);
			});
		}));
	}.bind(this));
}

function render(name) {
	var args = Array.prototype.slice.call(arguments, 1);
	this.compile(name, function (fn) {
		fn.apply(null, args);
	});
}

function rename(event) {
	this.cache.set(event.name, this.cache.remove(event.oldName));
}

function change(event) {
	this.cache.remove(event.name);
}

function Renderer(params) {
	params = params || {};
	var boundRename = rename.bind(this);
	var boundChange = change.bind(this);
	this.htmlLoader = new Loader({
		pathname: params.pathname,
		extname: 'html',
		options: params.options
	}).on('rename', boundRename).on('change', boundChange);
	// evil global modification
	extend(global, params.context);
	this.jsLoader = new Loader({
		pathname: params.pathname,
		extname: 'js',
		converter: function (data, callback) {
			try {
				data = vm.runInThisContext('(' + data.data + ')');
			}
			catch (err) {
				return callback(err);
			}
			callback(null, data);
		},
		options: params.options
	}).on('rename', boundRename).on('change', boundChange);
	this.cache = new Cache();
}

Renderer.prototype = {
	constructor: Renderer,
	debugMode: false,
	render: render,
	compile: compile
};

module.exports = Renderer;
