function (callback) {
	var client = this.client;
	var syncher = new Syncher();
	syncher.add(client.selectObjects.bind(client, 'category', {limit: -1}));
	syncher.add(client.selectObjects.bind(client, 'link', {limit: -1}));
	syncher.run(function (categoryArgs, linkArgs) {
		var err = categoryArgs[0] || linkArgs[0];
		callback(err ? null : {
			categories: categoryArgs[1],
			links: linkArgs[1]
		});
	});
}
