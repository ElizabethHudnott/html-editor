
const libraryHTML = Object.freeze({
	none: '',
	bootstrap: '<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous"/>\n',
	bootstrapFull: '<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous"/>\n<script defer src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js" integrity="sha384-smHYKdLADwkXOn1EmN1qk/HfnUcbVRZyYmZ4qpPea6sjB/pTJ0euyQp0Mk8ck+5T" crossorigin="anonymous"></script>\n',
	jQuery: '<script defer src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>\n',
	jQuerySlim: '<script defer src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E=" crossorigin="anonymous"></script>\n',
	mathJax: '<script src="mathjax-config.js"></script>\n<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js"></script>\n',
	popperJS: '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>\n',
});

//Maps editor DOM elements to editors.
let editors = new Map();

//Maps editors to app-specific data.
let paneData = new Map();

//Search
CodeMirror.commands.find = function (editor) {
	let searchPanel = paneData.get(editor).searchPanel;
	searchPanel.classList.remove('d-none');
	searchPanel.querySelector('.search').focus();
};

function createTab(paneName, tabName, tabTitle, active, beforeTab) {

	//Create a tab on the tab bar.
	let tabList = document.getElementById(paneName + '-tabs');
	let tabListItem = document.createElement('li');
	tabListItem.classList.add('nav-item');
	tabList.insertBefore(tabListItem, beforeTab? beforeTab.parentNode : null);

	let tab = document.createElement('a');
	tab.classList.add('nav-link');
	if (active) {
		tab.classList.add('active');
	}
	tab.setAttribute('id', tabName + '-tab');
	tab.setAttribute('data-toggle', 'tab');
	tab.setAttribute('href', '#' + tabName);
	tab.setAttribute('role', 'tab');
	tab.setAttribute('aria-selected', 'true');
	tab.innerHTML = tabTitle;
	tabListItem.appendChild(tab);

	//Create a <div> to put the tab's content into.
	let pane = document.getElementById(paneName);
	let outerDiv = document.createElement('div');
	outerDiv.classList.add('tab-pane');
	if (active) {
		outerDiv.classList.add('show');
		outerDiv.classList.add('active');
	}
	outerDiv.setAttribute('id', tabName);
	outerDiv.setAttribute('role', 'tabpanel');
	outerDiv.setAttribute('aria-labelledby', tabName + '-tab');
	pane.appendChild(outerDiv);

	let contentDiv = document.createElement('div');
	contentDiv.setAttribute('class', 'w-100 full-height d-flex flex-column');
	outerDiv.appendChild(contentDiv);
	return [$(tab), contentDiv];
}

function createEditor(container, mode) {
	let editorDOM;
	let editor = CodeMirror(function (element) {
			element.classList.add('flex-grow-1');
			container.appendChild(element);
			editorDOM = element;
		}, {
		autoCloseBrackets: '()[]{}\'\'""',
		matchBrackets: true,
		autoCloseTags: {
			whenClosing: true,
			whenOpening: true,
			indentTags: [
				"address", "article", "aside", "audio", "blockquote", "canvas", "colgroup",
				"datalist", "dd", "details", "dialog", "div", "dl", "fieldset", "figure",
				"footer", "form", "h1", "h2", "h3", "h4", "header", "hgroup", "iframe",
				"label", "map", "math", "menu", "nav", "noscript", "object", "ol",
				"optgroup", "p", "picture", "pre", "ruby", "section", "select", "style",
				"summary", "svg", "table", "tbody", "template", "textarea", "tfoot",
				"thead", "tr", "ul", "video"
			],
		},
		autofocus: true,
		indentWithTabs: true,
		lineWrapping: true,
		maxHighlightLength: Infinity,
		mode: mode,
		rtlMoveVisually: true,
		scrollbarStyle: 'simple',
		tabSize: 4,
		theme: 'eclipse',
	});
	editors.set(editorDOM, editor);

	let searchPanelOuter = document.createElement('div');
	searchPanelOuter.setAttribute('class', 'd-none d-print-none');
	container.appendChild(searchPanelOuter);

	let searchPanel = document.createElement('div');
	searchPanel.setAttribute('class', 'd-flex align-items-center py-1');
	searchPanelOuter.appendChild(searchPanel);

	let searchBox = document.createElement('input');
	searchBox.setAttribute('type', 'search');
	searchBox.setAttribute('class', 'form-control search flex-grow-1 mx-1');
	searchBox.setAttribute('placeholder', 'Search');
	searchBox.setAttribute('aria-label', 'Search');
	searchPanel.appendChild(searchBox);
	searchBox.addEventListener('input', function (event) {
		let searchStr = event.target.value;
		editor.showMatchesOnScrollbar(searchStr);
	});

	let closeSearchButton = document.createElement('button');
	closeSearchButton.setAttribute('type', 'button');
	closeSearchButton.setAttribute('class', 'close');
	closeSearchButton.setAttribute('aria-label', 'Close');
	closeSearchButton.innerHTML = '<span aria-hidden="true">&times;</span>';
	searchPanel.appendChild(closeSearchButton);
	closeSearchButton.addEventListener('click', function (event) {
		searchPanelOuter.classList.add('d-none');
		editor.focus();
	});

	//Indentation
	let charWidth = editor.defaultCharWidth(), basePadding = 4;
	editor.on("renderLine", function(cm, line, elt) {
		let off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
		elt.style.textIndent = "-" + off + "px";
		elt.style.paddingLeft = (basePadding + off) + "px";
	});

	if (mode === 'text/html') {
		//HTML language specific features

		//Autocomplete
		editor.on("inputRead", function(instance) {
		    if (instance.state.completionActive) {
		        return;
		    }
		    let cur = instance.getCursor();
		    let token = instance.getTokenAt(cur);
		    let string = token.string;
		    let autocompleteString = '';
		    if (string === '<') {
		        autocompleteString = string;
		    }
		    if (autocompleteString.length > 0) {
		        CodeMirror.commands.autocomplete(instance);
		    }
		});
	}

	paneData.set(editor, {
		searchPanel: searchPanelOuter,
	});

	return editor;
} //End createEditor function

//After clicking on the preview or help tabs, restore the keyboard focus to the appropriate editor.
function setFocus() {
	let editorDOMs = $('#left-pane>.show .CodeMirror');
	if (editorDOMs.length > 0) {
		editors.get(editorDOMs[0]).focus();
	}
}

let headTab = document.getElementById('head-tab');
let [htmlTab, htmlEditorContainer] = createTab('left-pane', 'content', 'Content', true, headTab);
let [cssTab, cssEditorContainer] = createTab('left-pane', 'style', 'Style', false, headTab);
let helpFrame = document.getElementById('help');

let htmlEditor = createEditor(htmlEditorContainer, 'text/html');
let cssEditor = createEditor(cssEditorContainer, 'text/css');
htmlEditor.focus();

htmlTab.on('shown.bs.tab', function (event) {
	htmlEditor.focus();
	helpFrame.src = 'help/index.html#content';
});

cssTab.on('shown.bs.tab', function (event) {
	cssEditor.focus();
	helpFrame.src = 'help/index.html#style';
});

document.getElementById('head').reset();

$(headTab).on('show.bs.tab', function (event) {
	helpFrame.src = 'help/index.html#head';
});

$('#help-tab').on('show.bs.tab', setFocus);
helpFrame.src = 'help/index.html#content';

//Preview
let previewTab = $('#preview-tab');
let previewVisible = previewTab.hasClass('show');
let previewDirty = true; //Firefox restores previous content on page refresh.

let previewFrame = document.getElementById('preview-frame');
let head = '';

function updatePreview() {
	let html = htmlEditor.getValue();
	let css = cssEditor.getValue();
	previewFrame.srcdoc = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="UTF-8">
				${head}
				<style>
					${css}
				</style>
			</head>
			<body>
				<main>
					${html}
				</main>
			</body>
		</html>
	`;
	previewDirty = false;
}

let previewTimer;
function queuePreview() {
	previewDirty = true;
	if (previewVisible) {
		clearTimeout(previewTimer);
		previewTimer = setTimeout(updatePreview, 300);
	}
}

previewTab.on('show.bs.tab', function (event) {
	setFocus();
	previewVisible = true;
	if (previewDirty) {
		updatePreview();
	}
});

previewTab.on('hide.bs.tab', function (event) {
	previewVisible = false;
	clearTimeout(previewTimer);
});

let optH1Title = document.getElementById('opt-h1-title');
let optHeadTitle = document.getElementById('opt-head-title');
let optSyncTitle = document.getElementById('opt-sync-title');
let h1Title = document.getElementById('title');

optH1Title.addEventListener('input', function (event) {
	let title = event.target.value;
	if (optSyncTitle.checked) {
		optHeadTitle.value = title;
	}
	h1Title.innerHTML = escapeHTML(title);
});

optSyncTitle.addEventListener('input', function (event) {
	let checked = event.target.checked;
	optHeadTitle.disabled = checked;
	if (checked) {
		optHeadTitle.value = optH1Title.value;
	}
});

let optJQuery = $('#opt-jquery input');
let optJQueryNone = document.getElementById('opt-jquery-none');
let optJQuerySlim = document.getElementById('opt-jquery-slim');
let optBootstrap = $('#opt-bootstrap input');
let optPopperJS = document.getElementById('opt-popper');
let optMathJax = document.getElementById('opt-mathjax');

function updateLibraries() {
	let jQueryOption = findCheckedRadioButton(optJQuery);
	let bootstrapOption = findCheckedRadioButton(optBootstrap);
	if (bootstrapOption === 'bootstrapFull') {
		optJQueryNone.disabled = true;
		if (jQueryOption === 'none') {
			jQueryOption = 'jQuerySlim';
			optJQuerySlim.checked = true;
		}
	} else {
		optJQueryNone.disabled = false;
	}

	head = '';
	if (optMathJax.checked) {
		head = head + libraryHTML.mathJax;
	}
	head = head + libraryHTML[jQueryOption];
	if (optPopperJS.checked) {
		head = head + libraryHTML.popperJS;
	}
	head = head + libraryHTML[bootstrapOption];
	queuePreview();
}

optJQuery.on('input', updateLibraries);
optBootstrap.on('input', updateLibraries);
optPopperJS.addEventListener('input', updateLibraries);
optMathJax.addEventListener('input', updateLibraries);

htmlEditor.on("change", queuePreview);
cssEditor.on("change", queuePreview);
