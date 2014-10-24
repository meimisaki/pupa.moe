'use strict';

var http = require('http');
var https = require('https');
var url = require('url');
var path = require('path');
var qs = require('querystring');
var fs = require('fs');

var exit = require('exit');

var Dispatcher = require('./dispatcher');
var Syncher = require('./syncher');
var Matcher = require('./matcher');

var extend = require('./extend');
var noop = require('./noop');

function wrapRequest(req, res) {
	req.parsedUrl = url.parse(req.url);
	req.parsedQuery = qs.parse(req.parsedUrl.query);
	var pathname = path.normalize(req.parsedUrl.pathname).replace(/(?:^|\/)\.+(?=$|\/)/g, '/');
	req.pathname = path.normalize('/' + pathname + '/').slice(1, -1);
	return req;
}

function wrapResponse(req, res) {
	extend(res, {
		die: function () {
			res.statusCode = 500;
			res.send();
		},
		redirect: function (url) {
			res.statusCode = 302;
			res.setHeader('location', url);
			res.end();
		},
		send: function (data) {
			res.data = data || res.data || http.STATUS_CODES[res.statusCode] || '';
			this.gzip(req, res, function () {
				var data = Object.prototype.hasOwnProperty.call(res, 'zippedData') ? res.zippedData : res.data;
				res.setHeader('content-length', data.length);
				res.end(data);
			});
		}.bind(this)
	});
	res.setTimeout(60 * 1000, function (event) {
		res.statusCode = 408;
		res.send();
	});
	return res;
}

function listener(req, res) {
	wrapRequest.call(this, req, res);
	wrapResponse.call(this, req, res);
	var index = -1, closed = false;
	res.on('close', function () {
		closed = true;
	});
	var method = req.method.toLowerCase();
	var next = function () {
		if (closed) return ;
		while (++index < this.handlers.length) {
			if (method.match(this.methods[index].toLowerCase()) && (req.params = this.patterns[index].match(req.pathname))) {
				break;
			}
		}
		if (index >= this.handlers.length) return res.die();
		req.matcher = this.patterns[index];
		this.handlers[index](req, res, next);
	}.bind(this);
	next();
}

function create() {
	this.server.listen(this.port);
}

function Responder(params) {
	params = params || {};
	this.https = !!params.https;
	this.port = params.port || (this.https ? 443 : 80);
	this.on('create', create.bind(this));
	if (this.https) {
		var syncher = new Syncher();
		syncher.add(fs.readFile.bind(fs, params.key));
		syncher.add(fs.readFile.bind(fs, params.cert));
		syncher.run(function (keyArgs, certArgs) {
			var err = keyArgs[0] || certArgs[0];
			if (err) {
				console.error(err);
				return exit(1);
			}
			this.server = https.createServer({
				key: keyArgs[1],
				cert: certArgs[1]
			}, listener.bind(this));
			this.dispatch({type: 'create'});
		}.bind(this));
	}
	else {
		this.server = http.createServer(listener.bind(this));
		this.dispatch({type: 'create'});
	}
	this.methods = [];
	this.patterns = [];
	this.handlers = [];
	this.gzip = params.gzip || noop;
}

function use() {
	var args = Array.prototype.slice.call(arguments);
	var handler = args.pop();
	if (typeof handler != 'function') throw new Error('handler expect type function');
	var method = args.length ? args.shift().trim() : '';
	args.length || args.push('**');
	args.forEach(function (pattern) {
		this.methods.push(method);
		this.patterns.push(new Matcher(pattern));
		this.handlers.push(handler);
	}, this);
}

function close(fn) {
	if (this.closed) return ;
	this.closed = true;
	this.server.close(function () {
		typeof fn == 'function' && fn();
		exit(1);
	});
}

Responder.prototype = extend(Object.create(Dispatcher.prototype), {
	constructor: Responder,
	USE: use,
	use: use,
	close: close
});

['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(function (method) {
	var alias = method.length < 6 ? method : method.slice(0, 3);
	Responder.prototype[alias] = Responder.prototype[alias.toLowerCase()] = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(method);
		use.apply(this, args);
	};
});

module.exports = Responder;
