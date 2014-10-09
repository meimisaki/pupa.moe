function (callback) {
	var client = this.client;
	this.res.statusCode = 404;
	client.randomID('article', function (err, id) {
		if (err) return callback();
		client.selectArticles({id: id}, function (err, articles) {
			return callback(err ? null : {article: articles.pop()});
		});
	});
}
