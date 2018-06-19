var paneData = new Map();

//Search
CodeMirror.commands.find = function (editor) {
	var searchPanel = paneData.get(editor).searchPanel;
	searchPanel.classList.remove('d-none');
	searchPanel.querySelector('.search').focus();
};

//-----------------------

function createTab(paneName, tabName, tabTitle, active, beforeTab) {

	//Create a tab on the tab bar.
	var tabList = document.getElementById(paneName + '-tabs');
	var tabListItem = document.createElement('li');
	tabListItem.classList.add('nav-item');
	tabList.insertBefore(tabListItem, beforeTab? beforeTab.parentNode : null);

	var tab = document.createElement('a');
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
	var pane = document.getElementById(paneName);
	var outerDiv = document.createElement('div');
	outerDiv.classList.add('tab-pane');
	if (active) {
		outerDiv.classList.add('show');
		outerDiv.classList.add('active');
	}
	outerDiv.setAttribute('id', tabName);
	outerDiv.setAttribute('role', 'tabpanel');
	outerDiv.setAttribute('aria-labelledby', tabName + '-tab');
	pane.appendChild(outerDiv);

	var contentDiv = document.createElement('div');
	contentDiv.setAttribute('class', 'w-100 full-height d-flex flex-column');
	outerDiv.appendChild(contentDiv);
	return [$(tab), contentDiv];
}

function createEditor(container, mode) {
	var editor = CodeMirror(function (element) {
			element.classList.add('flex-grow');
			container.appendChild(element);
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

	var searchPanelOuter = document.createElement('div');
	searchPanelOuter.setAttribute('class', 'd-none d-print-none');
	container.appendChild(searchPanelOuter);

	var searchPanel = document.createElement('div');
	searchPanel.setAttribute('class', 'd-flex align-items-center py-1');
	searchPanelOuter.appendChild(searchPanel);

	var searchBox = document.createElement('input');
	searchBox.setAttribute('type', 'search');
	searchBox.setAttribute('class', 'form-control search flex-grow mx-1');
	searchBox.setAttribute('placeholder', 'Search');
	searchBox.setAttribute('aria-label', 'Search');
	searchPanel.appendChild(searchBox);
	searchBox.addEventListener('input', function (event) {
		var searchStr = event.target.value;
		editor.showMatchesOnScrollbar(searchStr);
	});

	var closeSearchButton = document.createElement('button');
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
	var charWidth = editor.defaultCharWidth(), basePadding = 4;
	editor.on("renderLine", function(cm, line, elt) {
		var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
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
		    var cur = instance.getCursor();
		    var token = instance.getTokenAt(cur);
		    var string = token.string;
		    var autocompleteString = '';
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

var headTab = document.getElementById('head-tab');
var [htmlTab, htmlEditorContainer] = createTab('left-pane', 'content', 'Content', true, headTab);
var [cssTab, cssEditorContainer] = createTab('left-pane', 'style', 'Style', false, headTab);

var htmlEditor = createEditor(htmlEditorContainer, 'text/html');
var cssEditor = createEditor(cssEditorContainer, 'text/css');
htmlEditor.focus();

htmlTab.on('shown.bs.tab', function (event) {
	htmlEditor.focus();
});

cssTab.on('shown.bs.tab', function (event) {
	cssEditor.focus();
});

//Page options
var options = {
	mathjax: false
}
var head = '';

//Preview
var previewFrame = document.getElementById('preview');

function updateHead() {
	head = '';
	if (options.mathjax) {
		head = head + '<script src="mathjax-config.js"></script>\n<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js"></script>';
	}
}

document.getElementById('opt-mathjax').addEventListener('input', function (event) {
	options.mathjax = event.target.checked;
	updateHead();
	updatePreview();
});

function updatePreview() {
	var html = htmlEditor.getValue();
	var css = cssEditor.getValue();
	previewFrame.srcdoc = `<head>${head}<style>${css}</style></head>${html}`;
}

var previewTimer;
function queuePreview() {
	clearTimeout(previewTimer);
	previewTimer = setTimeout(updatePreview, 300);
}

htmlEditor.on("change", queuePreview);
cssEditor.on("change", queuePreview);
