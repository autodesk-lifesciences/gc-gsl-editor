/**
 * Defines behavior concerning editor comments.
 */

/**
 * Auto-inserts/auto-removes single line or multi-line comments based on the
 * selection or focus.
 * @param {AceEditor} ace editor
 */
export const toggleComments = (ace) => {
  const uncomment = (ace, token, pattern, row) => {
    const column = token.value.indexOf(pattern) + token.start;
    if (token.value.indexOf(pattern) !== -1) {
      ace.editor.session.replace({
        start: { row: row, column: column },
        end: {row: row, column: column + 2 },
      }, '');
    }
  };
  const selectionRange = ace.editor.selection.getRange();
  let selectedToken;
  if (ace.editor.getSelectedText() !== '') {
    // multi-line comments
    let addComment = true;

    for (selectedToken of ace.editor.session.getTokens(selectionRange.start.row)) {
      if (selectedToken.type === 'comment') {
        uncomment(ace, selectedToken, '*)', selectionRange.start.row);
        uncomment(ace, selectedToken, '(*', selectionRange.start.row);
        uncomment(ace, selectedToken, '//', selectionRange.start.row);
        addComment = false;
      }
    }

    for (selectedToken of ace.editor.session.getTokens(selectionRange.end.row)) {
      if (selectedToken.type === 'comment') {
        uncomment(ace, selectedToken, '(*', selectionRange.end.row);
        uncomment(ace, selectedToken, '//', selectionRange.end.row);
        uncomment(ace, selectedToken, '*)', selectionRange.end.row);
        addComment = false;
      }
    }

    if (addComment) {
      ace.editor.env.document.insert(selectionRange.start, '(*');
      ace.editor.env.document.insert(ace.editor.selection.getRange().end, '*)');
    }
  } else {
   // single-line comments
    let addComment = true;
    const cursorRow = ace.editor.getCursorPosition().row;
    for (selectedToken of ace.editor.session.getTokens(cursorRow)) {
      if (selectedToken.type === 'comment') {
        uncomment(ace, selectedToken, '(*', cursorRow);
        uncomment(ace, selectedToken, '//', cursorRow);
        uncomment(ace, selectedToken, '*)', cursorRow);
        addComment = false;
      }
    }
    if (addComment) {
      ace.editor.env.document.insert(ace.editor.getCursorPosition(), '//');
    }
  }
  ace.editor.focus();
};
