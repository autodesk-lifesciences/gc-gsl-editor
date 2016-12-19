import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';
import { loadProjectCode, saveProjectCode } from './src/behavior/compiler/client';
const extensionConfig = require('./package.json');
const gslState = require('./globals');

/**
 * The main render function.
 * @param {Object} container element of the extension.
 * @param {Object} other container size related data.
 */
function render(container, options) {
  const subscriber = window.constructor.store.subscribe((state, lastAction) => {
    if (lastAction.type === window.constructor.constants.actionTypes.DETAIL_VIEW_SELECT_EXTENSION) {
      ReactDOM.render(<GSLEditorLayout/>, container);
      if (gslState.hasOwnProperty('prevProject') && gslState.prevProject === window.constructor.api.projects.projectGetCurrentId()) {
        gslState.prevProject = window.constructor.api.projects.projectGetCurrentId();
      }
    } else if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_SAVE) {
      // save the current content of the editor.
      saveProjectCode();
    } else if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_OPEN) {
      loadProjectCode();
    }
  }, true);

  //return an unsubscribe function to clean up when the extension unmounts
  return subscriber;
}

window.constructor.extensions.register(extensionConfig.name, 'projectDetail', render);
