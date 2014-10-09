'use strict';

/*

$created_time for each object

HASH user:admin {
	$name,
	$avatar,
	$email,
	$password
}
STRING token:admin ($token) EXPIRES 86400s

ZSET article-list (+$date, $id)
HASH article:$id {
	$title,
	&category,
	$text,
	$tags
}
ZSET article:$id:comment-list (+$date, $comment-id)

ZSET comment-list (+$date, $id)
HASH comment:$id {
	$name,
	$md5,
	$text
}

ZSET category-list (+$date, $id)
HASH category:$id {
	$name,
	$title,
	$icon
}
ZSET category:$id:article-list (+$date, $article-id)

ZSET link-list (+$date, $id)
HASH link:$id {
	$name,
	$url,
	$icon
}

SET article:$id@index ($tag-substr) ($title-substr)

ZSET autocomplete (0, $tag-prefix)

*/

// acquire(), release(client), drain()
var clientPool = require('clientPool');

function DB(client) {
	this._ = client;
}

DB.prototype = {
	constructor: DB,
	release: function () {
		clientPool.release(this._);
	},
	// (key, callback)
	randomID: require('randomID'),
	// (key, id[, fields], callback)
	getObject: require('getObject'),
	// (key, obj, callback)
	addObject: require('addObject'),
	// (key, id, obj, callback)
	patchObject: require('patchObject'),
	// (key, id, callback)
	removeObject: require('removeObject'),
	// (key[, opts], callback)
	selectObjects: require('selectObjects'),
	// (key, id, tags, callback)
	createIndex: require('createIndex'),
	// (key, id, callback)
	removeIndex: require('removeIndex'),
	// (obj, callback)
	addArticle: require('addArticle'),
	// (id, obj, callback)
	patchArticle: require('patchArticle'),
	// (id, callback)
	removeArticle: require('removeArticle'),
	// ([[key,] opts,] callback)
	selectArticles: require('selectArticles'),
	// (obj, id, callback)
	addComment: require('addComment'),
	// (id, callback)
	getUser: require('getUser'),
	// (id, obj, callback)
	patchUser: require('patchUser'),
	// (id, callback)
	genToken: require('genToken'),
	// (tags, callback)
	addAutocomplete: require('addAutocomplete'),
	// (pre[, opts], callback)
	getAutocomplete: require('getAutocomplete')
};

// TODO: validate id(is uuid & exists)

function db() {
	return new DB(clientPool.acquire());
}

db.drain = clientPool.drain;

module.exports = db;
