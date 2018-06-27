/*	Converts a string into a live list of nodes.
	@param {string} html The HTML to convert into DOM objects.
	@return {NodeList}
*/
function htmlToNodes(html) {
	'use strict';
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

/*	Allows other windows to modify this page using the postMessage mechanism. The message
	should be an object with the following properties.
	location:
		Either a string representing an ID, or an array of indices used to navigate from
		the <html> element to the target element.
	operation:
		A string. One of: append, disabled, innerHTML, outerHTML, remove, removeAttribute or
		setAttribute.
	value:
		A string representing the text to insert (or a boolean for the disabled operation).
	name:
		A string representing the attribute name to target (removeAttribute and setAttribute only).
*/
window.addEventListener("message", function (event) {
	'use strict';
	let modification = event.data;

	let location = modification.location;
	let element;
	if (typeof(location) === 'string') {
		element = document.getElementById(location);
		if (element === null) {
			console.error('Document update: no element with id ' + location);
			return;
		}
	} else {
		let depth = 0;
		element = document.documentElement;
		for (const index of location) {
			let children = element.children;
			if (index >= children.length) {
				console.error('Document update: insufficient number of child nodes at depth ' + depth + ' in path ' + location);
				return;
			}
			element = children[index];
			depth++;
		}
	}

	let operation = modification.operation;
	let name = modification.name;
	let value = modification.value;

	switch (operation) {
	case 'append':
		let newNodes = htmlToNodes(value);
		while (newNodes.length > 0) {
			element.appendChild(newNodes[0]);
		}
		break;
	case 'disabled':
		element.disabled = value;
		break;
	case 'innerHTML':
		element.innerHTML = value;
		break;
	case 'outerHTML':
		element.outerHTML = value;
		break;
	case 'remove':
		element.parentNode.removeChild(element);
		break;
	case 'removeAttribute':
		element.removeAttribute(name);
		break;
	case 'setAttribute':
		element.setAttribute(name, value);
		break;
	default:
		console.error('Document update: unknown operation ' + operation);
	}
});

//Signal to the container page that we're loaded and ready.
window.parent.postMessage('loaded', '*');
