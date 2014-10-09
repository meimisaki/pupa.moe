'use strict';

$(window).load(function () {

	$('.search .autocomplete').data('callback', function (val, key) {
		this.val(val).closest('form').submit();
	});

	var divider = $('.divider').first();
	var body = $('.body');
	var sidebar = body.find('.side');
	var main = body.find('.main');
	function adjustSidebar() {
		if (divider.parent().css('display') == 'none') sidebar.css('margin-top', 0);
		else {
			var top = Math.min($(window).scrollTop(), main.offset().top + main.height() - sidebar.height());
			sidebar.css('margin-top', Math.max(0, top - divider.offset().top - divider.height()));
		}
	}
	var footer = $('.footer');
	function adjustFooter() {
		footer.css('margin-top', Math.max(0, $(window).height() - body.offset().top - body.height() - footer.height()));
	}
	adjustFooter();
	$(window).scroll(adjustSidebar).resize(adjustSidebar).resize(adjustFooter);

	$('#logout').click(function () {
		$.submit('/logout', 'POST');
	});

});
