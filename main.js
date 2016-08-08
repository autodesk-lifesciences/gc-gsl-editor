
import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';
const extensionConfig = require('./package.json');
import myState from './state';

function render(container, options) {

  var subscriber = window.constructor.store.subscribe(function (state, lastAction) {
    var current = state.focus.blockIds;
    if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_SAVE) {
      // save the current content of the editor.
      window.constructor.extensions.files.write(
        window.constructor.api.projects.projectGetCurrentId(),
        extensionConfig.name,
        'project.gsl',
        window.constructor.store['gslEditor']['editorContent'],
      )
    } else if (lastAction.type === window.constructor.constants.actionTypes.FOCUS_PROJECT) {
        console.log('TODO: Load the server content for the project. (Dont want to be overwriting GSL though)');
    }
    }
  );

  if (!window.constructor.store.hasOwnProperty('gslEditor')) {
    window.constructor.store['gslEditor'] = {};
  }
  ReactDOM.render(<GSLEditorLayout/>, container);
  //return an unsubscribe function to clean up when the extension unmounts
  return function () {
    subscriber();
  };
}

window.constructor.extensions.register(extensionConfig.name, render);
