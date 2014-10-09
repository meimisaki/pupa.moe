function (callback) {
	var client = this.client;
	var syncher = new Syncher();
	syncher.add(client.selectObjects.bind(client, 'category', {limit: -1}));
	if (this.req.params.id) syncher.add(client.selectArticles.bind(client, {id: this.req.params.id}));
	syncher.run(function (categoryArgs, articleArgs) {
		var err = categoryArgs[0] || articleArgs && articleArgs[0];
		callback(err ? null : {
			categories: categoryArgs[1],
			article: articleArgs && articleArgs[1].pop()
		});
	});
}
