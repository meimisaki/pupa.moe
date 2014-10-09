'use strict';

$.fn.extend({
	insertImage: function (url, file) {
		var editor = this.filter('.editor').first();
		if (!editor.length) return this;
		var selection = editor.data('selection');
		editor.removeData('selection').busy();
		$.uploadFile(url, file).done(function (data) {
			var img = $('<img />').attr('src', removeTrailingSlashes(url) + data.file);
			if (!selection) return editor.append(img);
			var range = selection.range;
			range.deleteContents();
			range.insertNode(img[0]);
		}).always(function () {
			editor.free();
		});
		return this;
	},
	busy: function () {
		return this.parent().css('position', 'relative').append($('<div class="busy"></div>'));
	},
	free: function () {
		this.parent().find('.busy').remove();
		return this;
	}
});

$.event.props.push('dataTransfer');

$(document).ready(function () {
	function isEventSupported(elem, type) {
		type = 'on' + type;
		var isSupported = type in elem;
		if (!isSupported && elem.setAttribute) {
			elem.setAttribute(type, 'return ;');
			isSupported = typeof elem[type] == 'function';
			elem.removeAttribute(type);
		}
		return isSupported;
	}
	var triggerSelectionChange = $(document).trigger.bind($(document), 'selectionchange');
	isEventSupported(document, 'selectionchange') || $.each(['mouseup', 'keyup'], function (key, type) {
		$(document).on(type, triggerSelectionChange);
	});

	function execCommand(cmd, val) {
		document.designMode = 'on';
		document.execCommand(cmd, false, val || null);
		document.designMode = 'off';
		triggerSelectionChange();
	}

	var effect = 'copy';
	$('.editor-container .editor').on('dragstart', function (event) {
		event.preventDefault();
		event.dataTransfer.effectAllowed = effect;
	}).on('dragenter', function (event) {
		event.preventDefault();
		if (!event.dataTransfer.items) return event.dataTransfer.dropEffect = effect;
		for (var key = 0 ; key < event.dataTransfer.items.length ; ++key) {
			var item = event.dataTransfer.items[key];
			if (item.kind == 'file' && /^image\//i.test(item.type)) {
				return event.dataTransfer.dropEffect = effect;
			}
		}
		event.dataTransfer.dropEffect = 'none';
	}).on('drop', function (event) {
		event.preventDefault();
		for (var key = 0 ; key < event.dataTransfer.files.length ; ++key) {
			var file = event.dataTransfer.files[key];
			if (/^image\//i.test(file.type)) {
				return $(this).insertImage('/upload', file);
			}
		}
	}).keydown(function (event) {
		if (event.which != 9) return ;
		// prevent the default tab behavior
		// convenient for code input
		event.preventDefault();
		execCommand('insertText', '    ');
		$(this).focus();
	});

	var $toolbar = $('.editor-container .toolbar');
	function adjustToolbar(event) {
		$toolbar.hide();
		var selection = window.getSelection();
		if (!selection.rangeCount) return ;
		var range = selection.getRangeAt(0);
		var editor = $(range.commonAncestorContainer).closest('.editor');
		if (!editor.length) return ;
		// range.toString() seems buggy
		// it returns newlines correctly in normal elements
		// but goes wrong in content editable ones
		editor.data('selection', {
			text: selection.toString(),
			range: range
		});
		if (selection.isCollapsed) return ;
		var editorRect = editor[0].getBoundingClientRect();
		var selectRect = range.getClientRects()[0];
		var toolbar = editor.parent().find('.toolbar');
		toolbar.show();
		toolbar.css('left', Math.min(editor.outerWidth() - toolbar.outerWidth(), selectRect.left - editorRect.left));
		toolbar.css('top', Math.max(-editor.offset().top, selectRect.top - editorRect.top - toolbar.outerHeight()));
	}
	$(window).resize(adjustToolbar);
	$(document).on('selectionchange', adjustToolbar);

	$toolbar.find('.highlight').click(function () {
		var toolbar = $(this);
		var editor = toolbar.closest('.editor-container').find('.editor');
		var selection = editor.data('selection');
		if (!selection) return ;
		editor.removeData('selection').busy();
		$.post('/highlight', {
			data: selection.text
		}, function (data) {
			var range = selection.range;
			range.deleteContents();
			range.insertNode($(data)[0]);
			editor.free();
		});
	});

	$.each([
		'bold',
		'italic',
		'underline',
		'strike-through',
		'remove-format',
		'insert-ordered-list',
		'insert-unordered-list',
		'justify-left',
		'justify-center',
		'justify-right',
		'justify-full'
	], function (key, type) {
		$toolbar.find('.' + type).click(execCommand.bind(null, $.camelCase(type)));
	});

	// create-link, unlink

});
