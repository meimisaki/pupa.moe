'use strict';

Function.prototype.bind = Function.prototype.bind || function (scope) {
	var args = Array.prototype.slice.call(arguments, 1);
	var fn = this;
	return function () {
		return fn.apply(scope, args.concat(Array.prototype.slice.call(arguments)));
	};
};

String.prototype.trim = String.prototype.trim || function () {
	return this.replace(/^\s+|\s+$/g, '');
};

function removeTrailingSlashes(str) {
	return str.replace(/\/*$/, '/');
}

$.extend({
	pathname: function (pathname) {
		if (!pathname) return removeTrailingSlashes(window.location.pathname);
		window.location.pathname = removeTrailingSlashes(pathname);
	},
	submit: function (action, method, obj) {
		var form = $('<form></form>');
		$(document.body).append(form);
		form.hide();
		form.attr('action', action);
		form.attr('method', method);
		obj && $.each(obj, function (key, val) {
			var field = $('<input />');
			field.attr('type', 'hidden');
			field.attr('name', key);
			field.attr('value', val);
			form.append(field);
		});
		form.submit();
	},
	browseFile: function () {
		var args = Array.prototype.slice.call(arguments);
		var callback = args.pop();
		if (typeof callback != 'function') return ;
		var opts = args.pop() || {};
		var input = $('#fileBrowser');
		if (!input.length) $(document.body).append(input = $('<input type="file" id="fileBrowser" />').hide());
		function fn() {
			callback.apply(input.off('change', fn), arguments);
		}
		opts.accept ? input.attr('accept', opts.accept) : input.removeAttr('accept');
		input.val(null).change(fn).click();
	},
	uploadFile: function (url, file) {
		var data = new FormData();
		data.append('file', file);
		return $.ajax({
			url: url,
			type: 'POST',
			data: data,
			cache: false,
			contentType: false,
			processData: false
		});
	}
});

$.fn.extend({
	dropdown: function (params) {
		if (!this.hasClass('dropdown')) return this;
		params = params || {};
		if (params.data) this.data('dropdown-data', params.data);
		else params.data = this.data('dropdown-data');
		if (params.callback) this.data('dropdown-callback', params.callback);
		else params.callback = this.data('dropdown-callback');
		this.data('dropdown-cursor', null);
		var menu = this.menu(), elem = this;
		if (!params.data || !params.data.length) {
			menu.removeClass('active');
			return this;
		}
		else menu.addClass('active').find('li').remove();
		$.each(params.data, function (key, val) {
			menu.append($('<li></li>').text(val).click(function () {
				params.callback && params.callback.call(elem, val, key);
			}));
		});
		return this;
	},
	menu: function () {
		return this.parent().find('.dropdown-menu');
	}
});

$(document).ready(function () {

	$('.dropdown').keydown(function (event) {
		var elem = $(this);
		var data = elem.data('dropdown-data');
		if (!data || !data.length) return ;
		var cursor = elem.data('dropdown-cursor');
		var opened = typeof cursor == 'number';
		switch (event.keyCode) {
		case 38:
			cursor = opened ? Math.max(0, cursor - 1) : data.length - 1;
			break;
		case 40:
			cursor = opened ? Math.min(data.length - 1, cursor + 1) : 0;
			break;
		case 13:
			var callback = elem.data('dropdown-callback');
			if (opened) {
				callback && callback.call(elem, data[cursor], cursor);
				break;
			}
		default:
			return ;
		}
		event.preventDefault();
		elem.data('dropdown-cursor', cursor).menu().find('li').removeClass('active').eq(cursor).addClass('active');
	}).each(function () {
		var elem = $(this);
		elem.data('dropdown-data', elem.menu().find('li').map(function () {
			return $(this).text();
		}));
	}).filter('.toggle').click(function (event) {
		event.stopPropagation();
		var elem = $(this);
		if (elem.menu().hasClass('active')) elem.menu().removeClass('active');
		else elem.dropdown();
	});
	var $menu = $('.dropdown-menu').click(function (event) {
		event.stopPropagation();
	});
	$(document).click(function () {
		$menu.removeClass('active');
	});

	$('.autocomplete').on('input', function () {
		var elem = $(this);
		if (!elem.val()) return elem.menu().removeClass('active');
		var xhr = elem.data('xhr');
		if (xhr) xhr.abort();
		xhr = $.getJSON('/autocomplete/' + encodeURIComponent(elem.val().trim()), function (data) {
			elem.dropdown({
				data: data,
				callback: elem.data('callback')
			});
		}).always(function () {
			elem.removeData('xhr');
		});
		elem.data('xhr', xhr);
	}).click(function (event) {
		event.stopPropagation();
	});

	var defaultSrc = '/images/default_avatar.png';
	$('.avatar img').error(function () {
		if (this.src != defaultSrc) this.src = defaultSrc;
	});

});
