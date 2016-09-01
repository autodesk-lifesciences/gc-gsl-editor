/**
 * Groups editor-related custom key bindings.
 */

/**
 * Registers a key binding to run the GSL code.
 * @param {AceEditor} aceEditor
 * @param {function} runCode function
 */
export const registerKeysRunCode = (ace, func) => {
  ace.editor.commands.addCommand({
    name: 'gslrun',
    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
    exec: function(editor) {
      func();
    },
    readOnly: true
  });
}