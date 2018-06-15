var paneData = new Map();

//Search
CodeMirror.commands.find = function (editor) {
	var searchPanel = paneData.get(editor).searchPanel;
	searchPanel.classList.remove('d-none');
	searchPanel.querySelector('.search').focus();
};

//-----------------------

function createTab(paneName, tabName, tabTitle, active) {

	//Create a tab on the tab bar.
	var tabList = document.getElementById(paneName + '-tabs');
	var tabListItem = document.createElement('li');
	tabListItem.classList.add('nav-item');
	tabList.append(tabListItem);

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
	tabListItem.append(tab);

	//Create a <div> to put the tab's content into.
	var pane = document.getElementById(paneName);
	var contentDiv = document.createElement('div');
	contentDiv.setAttribute('class', 'tab-pane fade w-100 full-height d-flex flex-column');
	if (active) {
		contentDiv.classList.add('show');
		contentDiv.classList.add('active');
	}
	contentDiv.setAttribute('id', tabName);
	contentDiv.setAttribute('role', 'tabpanel');
	contentDiv.setAttribute('aria-labelledby', tabName + '-tab');
	pane.append(contentDiv);

	return contentDiv;
}

function createEditor(container, mode) {
	var editor = CodeMirror(function (element) {
			element.classList.add('flex-grow');
			container.append(element);
		}, {
		autoCloseBrackets: '()[]{}\'\'""',
		matchBrackets: true,
		autoCloseTags: true,
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
	container.append(searchPanelOuter);

	var searchPanel = document.createElement('div');
	searchPanel.setAttribute('class', 'd-flex align-items-center py-1');
	searchPanelOuter.append(searchPanel);

	var searchBox = document.createElement('input');
	searchBox.setAttribute('type', 'search');
	searchBox.setAttribute('class', 'form-control search flex-grow mx-1');
	searchBox.setAttribute('placeholder', 'search');
	searchBox.setAttribute('aria-label', 'Search');
	searchPanel.append(searchBox);
	searchBox.addEventListener('input', function (event) {
		var searchStr = event.target.value;
		editor.showMatchesOnScrollbar(searchStr);
	});

	var closeSearchButton = document.createElement('button');
	closeSearchButton.setAttribute('type', 'button');
	closeSearchButton.setAttribute('class', 'close');
	closeSearchButton.setAttribute('aria-label', 'Close');
	closeSearchButton.innerHTML = '<span aria-hidden="true">&times;</span>';
	searchPanel.append(closeSearchButton);
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

var htmlEditorContainer = createTab('left-pane', 'content', 'Content', true);
var cssEditorContainer = createTab('left-pane', 'style', 'Style', false);

var htmlEditor = createEditor(htmlEditorContainer, 'text/html');
var cssEditor = createEditor(cssEditorContainer, 'text/css');
htmlEditor.focus();

//Preview
var previewFrame = document.getElementById('preview');

function updatePreview() {
	var html = htmlEditor.getValue();
	var css = cssEditor.getValue();
	previewFrame.srcdoc = `<style>${css}</style>${html}`;
}

var previewTimer;
function queuePreview() {
	clearTimeout(previewTimer);
	previewTimer = setTimeout(updatePreview, 300);
}

htmlEditor.on("change", queuePreview);
cssEditor.on("change", queuePreview);
