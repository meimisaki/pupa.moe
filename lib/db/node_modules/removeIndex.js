'use strict';

function removeIndex(key, id, callback) {
	var client = this._;
	client.del(key + ':' + id + '@index', callback);
}

module.exports = removeIndex;
