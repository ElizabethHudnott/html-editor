var editorPane = document.getElementById('editor-pane');
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
	tabSize: 2,
	theme: 'eclipse',
});

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

var charWidth = editor.defaultCharWidth(), basePadding = 4;
editor.on("renderLine", function(cm, line, elt) {
	var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
	elt.style.textIndent = "-" + off + "px";
	elt.style.paddingLeft = (basePadding + off) + "px";
});


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
