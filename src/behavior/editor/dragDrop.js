const _insertByType = (ace, dragPosition, payload, token ) => {
  // switch by id first. If the id is not present, switch by position.
  let insertPosition;
  let cursorPosition;
  switch(payload.item.id) {
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


export const insert = (ace, position, payload, evt) => {
  // Insert the character at the position.
  const dragPosition = ace.editor.renderer.pixelToScreenCoordinates(evt.pageX, evt.pageY);
  var token = ace.editor.session.getTokenAt(dragPosition.row, dragPosition.column);
  if (token) {
    const priorToken = null;
    // todo - check the previous token and see if its a prefix, and if this payload is a prefix, replace it
    // todo - make sure we only drop the operator on a valid gene or on an empty block
    if (payload.position === 'prefix' && priorToken && priorToken.className === 'prefix');

    // we want to handle the operator based on its position.
    ace.editor.clearSelection();
    _insertByType(ace, dragPosition, payload, token);
  }
  else {
    // The operator was dragged in a region that does not contain a symbol.
    ace.editor.env.document.insert(dragPosition, payload.item.text);
  }
  ace.editor.focus();
}
