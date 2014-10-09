function (callback) {
	var client = this.client;
	var key = this.req.params.id ? 'category:' + this.req.params.id : '';
	var query = this.req.parsedUrl.parsedQuery;
	var page = Math.max(0, parseInt(query.page) || 0);
	var limit = 10;
	client.selectArticles(key, {
		keyword: query.keyword,
		offset: page * limit,
		limit: limit + 1
	}, function (err, articles) {
		callback(err ? null : {
			articles: articles.slice(0, limit),
			hasPrev: articles.length == limit + 1,
			hasNext: !!page,
			page: page
		});
	});
}
