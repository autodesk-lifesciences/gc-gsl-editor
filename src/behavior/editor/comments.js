/**
 * Defines behavior concerning editor comments.
 */

/**
 * Auto-inserts/auto-removes single line or multi-line comments based on the
 * selection or focus.
 * @param {AceEditor} ace editor
 */ 
export const toggleComments = (ace) => {
  const uncomment = function(ace, token, pattern, row) {
   const column = token.value.indexOf(pattern) + token.start;
   if (token.value.indexOf(pattern) != -1) {
     ace.editor.session.replace({
       start: { row: row, column: column },
       end: {row: row, column: column+2}
     }, '');
   }
  };
  const selectionRange = ace.editor.selection.getRange();
  if(ace.editor.getSelectedText() !== '') {
   // multi-line comments
   let addComment = true;

   for (var token of ace.editor.session.getTokens(selectionRange.start.row)) {
     if (token.type === 'comment') {
       uncomment(ace, token, '*)', selectionRange.start.row);
       uncomment(ace, token, '(*', selectionRange.start.row);
       uncomment(ace, token, '//', selectionRange.start.row);
       addComment = false;
     }        
   }

   for(var token of ace.editor.session.getTokens(selectionRange.end.row)) {
     if (token.type === 'comment') {
       uncomment(ace, token, '(*', selectionRange.end.row);
       uncomment(ace, token, '//', selectionRange.end.row);
       uncomment(ace, token, '*)', selectionRange.end.row);
       addComment = false;
     }
   }

   if (addComment) {
     ace.editor.env.document.insert(selectionRange.start, '(*');
     ace.editor.env.document.insert(ace.editor.selection.getRange().end, '*)');
   }
  }
  else {
   // single-line comments
   let addComment = true;
   const cursorRow = ace.editor.getCursorPosition().row;
   for(var token of ace.editor.session.getTokens(cursorRow)) {
     if (token.type === 'comment') {
       uncomment(ace, token, '(*', cursorRow);
       uncomment(ace, token, '//', cursorRow);
       uncomment(ace, token, '*)', cursorRow);
       addComment = false;
     }
   }
   if (addComment)
     ace.editor.env.document.insert(ace.editor.getCursorPosition(), '//');
  }
  ace.editor.focus();
}
