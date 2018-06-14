var paneData = new Map();

//Search
CodeMirror.commands.find = function (editor) {
	var searchPanel = paneData.get(editor).searchPanel;
	searchPanel.classList.remove('d-none');
	searchPanel.querySelector('.search').focus();
};

var editorPane = document.getElementById('editor-pane');

//-----------------------

var editor = CodeMirror(editorPane, {
	autoCloseBrackets: '()[]{}\'\'""',
	matchBrackets: true,
	autoCloseTags: true,
	autofocus: true,
	indentWithTabs: true,
	lineWrapping: true,
	maxHighlightLength: Infinity,
	mode: 'text/html',
	rtlMoveVisually: true,
	scrollbarStyle: 'simple',
	tabSize: 4,
	theme: 'eclipse',
});

var searchPanelOuter = document.createElement('div');
searchPanelOuter.setAttribute('class', 'd-none d-print-none');
editorPane.append(searchPanelOuter);

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

paneData.set(editor, {
	searchPanel: searchPanelOuter,
});

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

//Indentation
var charWidth = editor.defaultCharWidth(), basePadding = 4;
editor.on("renderLine", function(cm, line, elt) {
	var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
	elt.style.textIndent = "-" + off + "px";
	elt.style.paddingLeft = (basePadding + off) + "px";
});

//Preview
var delay;
editor.on("change", function() {
	clearTimeout(delay);
	delay = setTimeout(updatePreview, 300);
});

function updatePreview() {
	var previewFrame = document.getElementById('preview');
	var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
	preview.open();
	preview.write(editor.getValue());
	preview.close();
}
