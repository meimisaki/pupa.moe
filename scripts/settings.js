'use strict';

$(document).ready(function () {
	$('.link input').focus(function () {
		$(this).closest('.flip-container').addClass('hover');
	}).blur(function () {
		$(this).closest('.flip-container').removeClass('hover');
	});
	$('.link .remove').click(function () {
		$.submit('/link/' + $(this).data('id'), 'DELETE');
	});

	var admin = $('.admin');
	var name = admin.find('.name');
	var email = admin.find('.email');
	var avatar = admin.find('input[type="button"]');
	var oldPassword = admin.find('.old-password');
	var newPassword = admin.find('.new-password');
	var submit = admin.find('input[type="submit"]');
	avatar.click(function () {
		$.browseFile({
			accept: 'image/*'
		}, function () {
			var files = this.prop('files');
			if (!files.length) return ;
			$.uploadFile('/upload', files[0]).done(function (data) {
				avatar.data('src', '/upload/' + data.file);
				alert('avatar: upload success');
			}).fail(function () {
				alert('avatar: upload fail');
			});
		});
	});
	submit.click(function () {
		var oldVal = oldPassword.val();
		var newVal = newPassword.val();
		$.post('/admin', {
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
	});
});
