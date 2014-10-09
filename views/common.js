function (callback) {
	var client = this.client;
	client.getObject('config', 'global', function (err, config) {
		if (err) return callback();
		callback({config: config});
	});
}
