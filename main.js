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
  //always render on load
  ReactDOM.render(<GSLEditorLayout/>, container);

  const subscriber = window.constructor.store.subscribe((state, lastAction) => {
    // console.log(`lastAction.type: ${lastAction.type}`);
    if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_SAVE) {
      // save the current content of the editor.
      // console.log('GSL Save');
      saveProjectCode();
      // console.log('GSL Saved');
    } else if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_OPEN) {
      // console.log('GSL Load');
      loadProjectCode();
      // console.log('GSL Loaded');
    } else {
      // console.log('GSL Nothing');
    }
  }, true);

  //return an unsubscribe function to clean up when the extension unmounts
  return subscriber;
}

window.constructor.extensions.register(extensionConfig.name, 'projectDetail', render);
