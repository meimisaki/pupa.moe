function (callback) {
	var client = this.client;
	client.selectArticles({
		id: this.req.params.id,
		withCommentList: true
	}, function (err, articles) {
		if (err) return callback();
		var article = articles.pop();
		article.comment_list && article.comment_list.reverse();
		callback({article: article});
	});
}
