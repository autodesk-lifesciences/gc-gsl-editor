/**
 * Defines the drag-drop behavior of the GSL operators in the editor.
 */

/**
 * Inserts the required characters on drag and dropping the GSL operators into the editor
 * based on the editor and the type of operator.
 * @param {AceEditor} ace editor
 * @param {Object} drag position eg.{ row: 4, column: 5}
 * @param {string} payload text to be inserted when dropped.
 * @param {token} the token on which the operator is dropped.
 */
const _insertByType = (ace, dragPosition, payload, token ) => {
  // switch by id first. If the id is not present, switch by position.
  let insertPosition;
  let cursorPosition;
  switch(payload.item.id) {
    case '!':
      insertPosition = { row: dragPosition.row, column: token.start };
      ace.editor.env.document.insert(insertPosition, payload.item.text);
      cursorPosition = { row: insertPosition.row, column: insertPosition.column + 1};
      ace.editor.moveCursorToPosition(cursorPosition);
      break;    
    default:
      // switch by position
      switch(payload.item.position) {
        case 'prefix':
          insertPosition = { row: dragPosition.row, column: token.start };
          ace.editor.env.document.insert(insertPosition, payload.item.text);
          cursorPosition = { row: insertPosition.row, column: insertPosition.column + 1};
          ace.editor.moveCursorToPosition(cursorPosition);
          break;
        case 'postfix':
          insertPosition = { row: dragPosition.row, column: token.start + token.value.length};
          ace.editor.env.document.insert(insertPosition, payload.item.text);
          ace.editor.moveCursorToPosition(insertPosition);
          cursorPosition = { row: insertPosition.row, column: insertPosition.column + 1};
          ace.editor.moveCursorToPosition(cursorPosition);
          break;
        default:
          ace.editor.env.document.insert(dragPosition, payload.item.text);
          cursorPosition = { row: dragPosition.row, column: dragPosition.column+ payload.item.text.length};
          ace.editor.moveCursorToPosition(cursorPosition);
          break;
      }
      break;
  }
}

/**
 * Inserts the required characters on drag and dropping the GSL operators into the editor.
 * @param {AceEditor} ace editor
 * @param {Object} drag position eg.{ row: 4, column: 5}
 * @param {string} payload text to be inserted when dropped.
 * @param {MouseEvent} drag-drop event 
 */
export const insert = (ace, position, payload, evt) => {
  // Insert the character at the position.
  const dragPosition = ace.editor.renderer.pixelToScreenCoordinates(evt.pageX, evt.pageY);
  var token = ace.editor.session.getTokenAt(dragPosition.row, dragPosition.column);

  if (token) {
    // check the previous token and see if its a prefix, and if this payload is a prefix, replace it
    const tokens = ace.editor.session.getTokens(dragPosition.row);
    const tokenIndex = tokens.indexOf(token);
    const operators = ['g', 'p', 't', 'u', 'd', 'o', 'f', 'm'];
    if (tokenIndex > 0) {
      const priorToken = tokens[tokenIndex-1];
      priorToken.start = token.start - 1;
      if (priorToken.type === 'keyword.operator' && operators.indexOf(priorToken.value) >= 0 && 
        payload.item.text !== '!') {
        ace.editor.session.replace({
          start: { row: dragPosition.row, column: priorToken.start },
          end: {row: dragPosition.row, column: priorToken.start+1}
        }, payload.item.text);
      }
      else {
        // we want to handle the operator based on its position.
        ace.editor.clearSelection();
        _insertByType(ace, dragPosition, payload, token);
      }
    } 
    else {
      // we want to handle the operator based on its position.
      ace.editor.clearSelection();
      _insertByType(ace, dragPosition, payload, token);
    }
  }
  else {
    // The operator was dragged in a region that does not contain a symbol.
    ace.editor.env.document.insert(dragPosition, payload.item.text);
  }
  ace.editor.focus();
}
