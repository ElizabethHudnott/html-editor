/**	Mappings between characters that need to be escaped in HTML code (to prevent cross-site
	scripting attacks) and their corresponding escape sequences, i.e. HTML character entities.
	@readonly
*/
const ESCAPE_MAP = Object.freeze({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
});

/**	Escapes a string so that any HTML code contained within it is converted into plain
	text.
	@param {string} input The text to make safe.
*/
function escapeHTML(input) {
	'use strict';
	return String(input).replace(/[&<>"']/g, function (match) {
		return ESCAPE_MAP[match];
	});
}

function findCheckedRadioButton(buttons) {
	'use strict';
	for (let button of buttons) {
		if (button.checked) {
			return button.value;
		}
	}
}
