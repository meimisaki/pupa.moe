'use strict';

$(document).ready(function () {

	var title = $('.edit .info input[type="text"]');
	var category = $('.edit .info .dropdown').data('dropdown-callback', function (val, key) {
		this.val(val).data('id', this.data('idArray')[key]).menu().removeClass('active');
	});
	var editor = $('.edit .editor-container .editor');

	var tag = $('.edit .tag-manip input').keydown(function (event) {
		if (event.which != 13) return ;
		event.preventDefault();
		addTag(tag.val());
		tag.val('');
	});

	var tags = tag.closest('.tag-manip').data('tags');
	for (var key in tags) {
		tags[key] && addTag(tags[key]);
	}

	function removeTag() {
		$(this).closest('.tag').remove();
	}

	function addTag(text) {
		var elem = $('<span class="tag"><span></span></span>');
		elem.find('span').text(text.trim());
		var close = $('<a href="javascript:;">&#215;</a>').click(removeTag);
		elem.append(close);
		elem.insertBefore(tag);
	}

	$('.edit #post').click(function () {
		var id = category.data('id');
		if (!id) return alert('please select a category');
		$.submit($.pathname(), 'POST', {
			title: title.val().trim(),
			category: id,
			text: editor.html(),
			tags: tag.closest('.tag-manip').find('.tag span').map(function () {
				return $(this).text();
			}).toArray().join('\n')
		});
	});

});
