'use strict';

$(document).ready(function () {

	$('.article-manip .remove').click(function () {
		if (!confirm('Are you sure you want to delete this article?')) return ;
		$.submit($.pathname() + 'remove', 'POST');
	});

	var nickname = $('.nickname input');
	var email = $('.email input');
	var avatar = email.closest('.comment').find('.avatar img');
	var prefix = window.location.protocol == 'https:' ? 'https://secure' : 'http://www';
	email.change(function () {
		avatar.attr('src', prefix + '.gravatar.com/avatar/' + md5(email.val().trim()) + '?d=404');
	});

	var editor = $('.editor-container .editor');

	$('.comment .reply').click(function () {
		var elem = $(this).closest('.comment');
		var text = 'RE: ' + elem.data('floor') + 'F (' + elem.find('.name').text() + ')';
		var node = editor.contents().first();
		if (/^RE:\s+\d+F/i.test(node.text().trim())) node.remove();
		editor.prepend($('<div></div>').text(text));
	});

	$('#post').click(function () {
		$.submit('', 'POST', {
			name: nickname.val().trim() || 'ANONYMOUS',
			md5: md5(email.val().trim()),
			text: editor.html()
		});
	});

});
