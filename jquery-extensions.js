function makeSameHeight(container) {
	'use strict';
	if (!container.data('resized')) {
		let maxHeight = 0;
		let children = container.children();
		children.each(function () {
			let tab = $(this);
			let isActive = tab.hasClass('active');
			if (!isActive) {
				tab.addClass('active');
			}
			let height = tab.height();
			if (height > maxHeight) {
				maxHeight = height;
			}
			if (!isActive) {
				tab.removeClass('active');
			}
		});
		children.css('min-height', maxHeight);
		container.data('resized', true);
	}
}
