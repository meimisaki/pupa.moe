'use strict';

var url = require('url');
var path = require('path');

var each = require('./lib/each');
var inherit = require('./lib/inherit');
var extract = require('./lib/extract');

var config = require('./lib/config');

var gzip = require('./lib/gzip')(config);

var Syncher = require('./lib/syncher');

var Responder = require('./lib/responder');

var responder = new Responder({
	port: config.PORT,
	gzip: gzip
});

responder.use(require('./lib/protector')(function (err, req, res, next) {
	// handle uncaught exceptions
	console.error(err);
	res.die();
	responder.close();
}));

if (config.LOG_ENABLED) {
	var format = ':method :status-code :url :date :response-time ms';
	responder.use(require('./lib/logger')(format));
}

var verification = config.WEBMASTERS.VERIFICATION;

responder.get(verification.NAME + '.html', function (req, res, next) {
	res.send(verification.HTML);
});

var db = require('./lib/db');

responder.get('autocomplete/:pre', function (req, res, next) {
	var client = db();
	var pre = decodeURIComponent(req.params.pre);
	client.getAutocomplete(pre, function (err, arr) {
		client.release();
		if (err) return res.die();
		res.extname = 'json';
		res.send(JSON.stringify(arr));
	});
});

var verifier = require('./lib/verifier')();

var Renderer = require('./lib/renderer');

var renderer = new Renderer({
	pathname: path.join(__dirname, 'views'),
	context: {
		Syncher: Syncher
	}
});

function renderOnce(name) {
	if (Object.prototype.hasOwnProperty.call(this, name)) return false;
	return this[name] = true;
}

var Matcher = require('./lib/matcher');

var gaPatterns = [];

config.GA_TARGETS && config.GA_TARGETS.forEach(function (target) {
	gaPatterns.push(new Matcher(target));
});

function render(req, res, name) {
	verifier(req, res, function () {
		res.gaDisabled = !Matcher.match(gaPatterns, res.target);
		var client = db();
		renderer.render(name || 'common', {
			req: req,
			res: res,
			renderOnce: renderOnce.bind({}),
			client: client
		}, function (rendered) {
			client.release();
			res.extname = 'html';
			res.send(rendered);
		});
	});
}

responder.get('', 'index', 'category/:id', function (req, res, next) {
	res.target = 'index';
	res.framed = true;
	render(req, res);
});

responder.get('author', function (req, res, next) {
	res.target = req.pathname;
	render(req, res);
});

var domain = config.DOMAIN;
var localhost = /^(?:localhost|127\.0\.0\.1)$/i;

function matchDomain(val) {
	var hostname = url.parse(val || '').hostname || '';
	return localhost.test(hostname) || ('.' + hostname).slice(-1 - domain.length) == '.' + domain;
}

responder.get('login', function (req, res, next) {
	verifier(req, res, function () {
		if (req.verified) return res.redirect('/');
		if (!matchDomain(req.headers.referer)) req.headers.referer = '/';
		res.target = 'login';
		render(req, res);
	});
});

function unauthorized(req, res, url) {
	req.headers.referer = url || req.url;
	res.statusCode = 401;
	res.target = 'login';
	render(req, res);
}

responder.get('settings', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return unauthorized(req, res);
		res.target = 'settings';
		render(req, res);
	});
});

responder.get('post', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return unauthorized(req, res);
		res.target = 'edit';
		render(req, res);
	});
});

responder.get('article/:id', function (req, res, next) {
	res.target = 'inner';
	res.framed = true;
	render(req, res);
});

responder.get('article/:id/edit', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return unauthorized(req, res);
		res.target = 'edit';
		render(req, res);
	});
});

responder.get(require('./lib/provider')(inherit(config, {
	pathname: __dirname,
	gzip: gzip
})));

function clientRedirect(req, res, url, delay) {
	res.delay = delay || config.REDIRECT_DELAY;
	res.url = url;
	render(req, res, 'redirect');
}

var serialize = require('./lib/serialize');

responder.post(require('./lib/receiver')({
	maxLength: config.FILE_MAX_SIZE
}));

var maxAge = config.COOKIE_MAX_AGE;

responder.post('login', function (req, res, next) {
	verifier(req, res, function () {
		if (req.verified) return res.redirect('/');
		if (req.form.fields.password === req.user.password) {
			var client = db();
			return client.genToken('admin', function (err, token) {
				client.release();
				if (err) return res.die();
				var expires = new Date();
				expires.setSeconds(expires.getSeconds() + maxAge);
				res.setHeader('set-cookie', serialize('token', token, req.form.fields.remember == '1' ? {
					expires: expires,
					maxAge: maxAge
				} : null));
				clientRedirect(req, res, req.form.fields.referer);
			});
		}
		// TODO: alert password error
		res.target = 'login';
		render(req, res);
	});
});

var outOfDate = new Date(0);

responder.post('logout', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return res.redirect('/');
		res.setHeader('set-cookie', serialize('token', 'deleted', {
			expires: outOfDate
		}));
		clientRedirect(req, res, '/');
	});
});

responder.post('admin', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) {
			res.statusCode = 401;
			return res.send();
		}
		var client = db();
		client.patchUser('admin', req.form.fields, function (err) {
			client.release();
			if (err) return res.die();
			res.send();
		});
	});
});

var highlight = require('highlight.js');

responder.post('highlight', function (req, res, next) {
	var obj = highlight.highlightAuto(req.form.fields.data || '');
	res.extname = 'html';
	res.send('<pre><code>' + obj.value + '</code></pre>');
});

responder.post('post', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return unauthorized(req, res);
		var client = db();
		client.addArticle(req.form.fields, function (err, id) {
			client.release();
			if (err) return res.die();
			clientRedirect(req, res, '/article/' + id);
		});
	});
});

responder.post('article/:id/edit', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return unauthorized(req, res);
		var client = db();
		client.patchArticle(req.params.id, req.form.fields, function (err) {
			client.release();
			if (err) return res.die();
			clientRedirect(req, res, '/article/' + req.params.id);
		});
	});
});

responder.post('article/:id/remove', function (req, res, next) {
	verifier(req, res, function () {
		if (!req.verified) return unauthorized(req, res, '/article/' + req.params.id);
		var client = db();
		client.removeArticle(req.params.id, function (err) {
			client.release();
			if (err) return res.die();
			clientRedirect(req, res, '/');
		});
	});
});

responder.post('article/:id', function (req, res, next) {
	var client = db();
	client.addComment(req.form.fields, req.params.id, function (err) {
		client.release();
		if (err) return res.die();
		res.target = 'inner';
		res.framed = true;
		render(req, res);
	});
});

var fs = require('fs');
var uuid = require('./lib/uuid');

var uploadPath = path.join(__dirname, 'upload');

fs.mkdir(uploadPath, function (err) {
	// ignore error
	responder.post('upload', function (req, res, next) {
		var obj = {}, syncher = new Syncher();
		each(req.form.files, function (val, key) {
			var to = path.join(uploadPath, obj[key] = uuid() + path.extname(val.name));
			syncher.add(fs.rename.bind(fs, val.path, to));
		});
		syncher.run(function () {
			for (var key = 0 ; key < arguments.length ; ++key) {
				if (!arguments[key][0]) continue;
				return res.die();
			}
			res.statusCode = 200;
			res.extname = 'json';
			res.send(JSON.stringify(obj));
		});
	});
});
