'use strict';

var exit = require('exit');

var db = require('../lib/db');

var Syncher = require('../lib/syncher');

var md5 = require('../lib/md5');
var uuid = require('../lib/uuid');

var syncher = new Syncher();

var client = db();

/*======== begin ========*/

var admin = {
	id: 'admin',
	name: 'そらかすがの',
	avatar: '/test/images/avatar.jpg',
	email: 'meimisaki@gmail.com',
	password: md5('123456')
};

var config = {
	id: 'global',
	title: '「夢？現実？」',
	signature: '忘れたくない思い、ありますか？',
	ga: false,
	script: [
		'(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){',
		'(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),',
		'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)',
		'})(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');',
		'ga(\'create\',\'UA-53901025-1\',\'auto\');',
		'ga(\'send\',\'pageview\');'
	].join('')
};

var categories = [
	{
		id: uuid(),
		name: 'coding',
		title: 'コーディング',
		icon: '/test/images/icons/coding.svg'
	},
	{
		id: uuid(),
		name: 'anime',
		title: 'アニメ',
		icon: '/test/images/icons/anime.svg'
	},
	{
		id: uuid(),
		name: 'footprint',
		title: 'あしあと',
		icon: '/test/images/icons/footprint.svg'
	},
	{
		id: uuid(),
		name: 'painting',
		title: '絵',
		icon: '/test/images/icons/painting.svg'
	}
];

var links = [
	{
		name: 'twitter',
		url: 'https://twitter.com/SoraKasugano1',
		icon: '/test/images/icons/twitter.svg'
	},
	{
		name: 'facebook',
		url: 'https://www.facebook.com/sora.kasugano.QAQ',
		icon: '/test/images/icons/facebook.svg'
	},
	{
		name: 'linkedin',
		url: 'http://www.linkedin.com/profile/view?id=303225603',
		icon: '/test/images/icons/linkedin.svg'
	},
	{
		name: 'google_plus',
		url: 'https://plus.google.com/+%E8%A6%8B%E5%B4%8E%E9%B3%B4sora',
		icon: '/test/images/icons/google_plus.svg'
	},
	{
		name: 'github',
		url: 'https://github.com/meimisaki',
		icon: '/test/images/icons/github.svg'
	}
];

var articles = [
	{
		key: 'first',
		tags: 'sora  \n   sorata'
	},
	{
		key: 'second',
		tags: '   misaka\n mikoto  '
	},
	{
		key: 'third',
		tags: 'miuna\nmanaka'
	}
];

var visitors = [
	{
		email: 'meimisaki@gmail.com',
		name: 'SoraKasugano'
	},
	{
		email: 'i.nitrop@gmail.com',
		name: 'NitroP'
	},
	{
		email: 'kilnyy@gmail.com',
		name: 'XiaoMing'
	}
];

/*======== end ========*/

syncher.add(client.addObject.bind(client, 'user', admin));

syncher.add(client.addObject.bind(client, 'config', config));

categories.forEach(function (obj) {
	syncher.add(client.addObject.bind(client, 'category', obj));
});

links.forEach(function (obj) {
	syncher.add(client.addObject.bind(client, 'link', obj));
});

articles.forEach(function (val) {
	syncher.add(function (callback) {
		client.addArticle({
			title: val.key + ' article',
			category: categories[Math.floor(Math.random() * categories.length)].id,
			text: val.key + ' contents',
			tags: val.tags
		}, function (err, id) {
			if (err) return callback(err);
			function comment() {
				var user = visitors[Math.floor(Math.random() * visitors.length)];
				client.addComment({
					name: user.name,
					md5: md5(user.email),
					text: Math.random().toString()
				}, id, function (err) {
					if (err || Math.random() * 3 < 1) callback(err);
					else comment();
				});
			}
			comment();
		});
	});
});

syncher.run(function () {
	db.drain();
	for (var key = 0 ; key < arguments.length ; ++key) {
		var err = arguments[key][0];
		if (err) {
			console.error(err);
			exit(1);
		}
	}
});
