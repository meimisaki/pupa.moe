'use strict';

module.exports = {
	PORT: 8080,
	DOMAIN: "pupa.moe",
	COOKIE_MAX_AGE: 86400,
	CACHE_MAX_SIZE: 128 * 1024 * 1024,
	FILE_MAX_SIZE: 2 * 1024 * 1024,
	REDIS_CLIENT_LIMIT: 8,
	REDIRECT_DELAY: 3,
	PRIVATE_PATHS: [
		"*",
		"lib/**",
		"node_modules/**",
		"views/**",
		"test/*"
	],
	PUBLIC_PATHS: [
		"upload/**",
		"bower_components/**",
		"styles/**",
		"scripts/**",
		"images/**",
		"test/images/**"
	],
	GA_TARGETS: [
		"index",
		"author",
		"login",
		"inner"
	],
	GZIP_TYPES: [
		"html",
		"txt",
		"css",
		"less",
		"js",
		"json",
		"svg"
	]
};
