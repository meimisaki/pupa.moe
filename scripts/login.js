'use strict';

$(window).load(function () {
	var login = $('.login');
	function adjust() {
		login.css('margin-top', Math.max(0, ($(window).height() - login.height()) * 0.5));
	}
	$(window).resize(adjust);
	adjust();

	var form = login.find('form');
	form.submit(function (event) {
		event.preventDefault();
		var obj = {};
		$.each(form.serializeArray(), function () {
			obj[this.name] = this.value;
		});
		obj.password = md5(obj.password);
		$.submit(form.attr('action'), form.attr('method'), obj);
	});
});
