'use strict';

function atomic(fn) {
	var xhr;
	function clear() {
		xhr = null;
	}
	return function () {
		if (xhr) xhr.abort();
		if (xhr = fn.apply(this, arguments)) xhr.always(clear);
	};
}

$(document).ready(function () {
	initLink();
	initConfig();
	initAdmin();
});

function initLink() {
	$('.link input').focus(function () {
		$(this).closest('.flip-container').addClass('hover');
	}).blur(function () {
		$(this).closest('.flip-container').removeClass('hover');
	});
	$('.link .remove').click(function () {
		$.submit('/link/' + $(this).data('id'), 'DELETE');
	});
}

function initConfig() {
	var config = $('.config');
	var title = config.find('.title');
	var signature = config.find('.signature');
	var script = config.find('.script');
	var status = config.find('input[type="button"]');
	var submit = config.find('input[type="submit"]');
	status.click(function () {
		var enabled = status.data('enabled');
		status.val(enabled ? 'ENABLE GA' : 'DISABLE GA');
		status.data('enabled', !enabled);
	});
	submit.click(atomic(function () {
		return $.post('/config', {
			title: title.val(),
			signature: signature.val(),
			script: script.val(),
			ga: '' + status.data('enabled')
		}).done(function () {
			alert('config: post success');
		}).fail(function () {
			alert('config: post fail');
		});
	}));
}

function initAdmin() {
	var admin = $('.admin');
	var name = admin.find('.name');
	var email = admin.find('.email');
	var avatar = admin.find('input[type="button"]');
	var oldPassword = admin.find('.old-password');
	var newPassword = admin.find('.new-password');
	var submit = admin.find('input[type="submit"]');
	var upload = atomic(function () {
		var files = this.prop('files');
		if (!files.length) return ;
		return $.uploadFile('/upload', files[0]).done(function (data) {
			avatar.data('src', '/upload/' + data.file);
			alert('avatar: upload success');
		}).fail(function () {
			alert('avatar: upload fail');
		});
	});
	avatar.click(function () {
		$.browseFile({
			accept: 'image/*'
		}, upload);
	});
	submit.click(atomic(function () {
		var oldVal = oldPassword.val();
		var newVal = newPassword.val();
		return $.post('/admin', {
			name: name.val(),
			email: email.val(),
			avatar: avatar.data('src'),
			old_password: oldVal && md5(oldVal),
			new_password: newVal && md5(newVal)
		}).done(function () {
			alert('admin: post success');
		}).fail(function () {
			alert('admin: post fail');
		});
	}));
}
