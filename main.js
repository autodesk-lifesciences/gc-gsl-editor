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

  // ref to action type constants in constructor
  const { actionTypes } = window.constructor.constants;

  const subscriber = window.constructor.store.subscribe((state, lastAction) => {
    switch (lastAction.type) {
      case actionTypes.PROJECT_BEFORE_OPEN:
      case actionTypes.PROJECT_SAVE: {
        const { projectId } = lastAction;
        //setProjectCode(projectId, gslState.editorContent); // don't save remotely, just locally
        saveProjectCode(projectId, gslState.editorContent); //save the code before the project changes
        break;
      }
      case actionTypes.PROJECT_OPEN: {
        //console.log('loading next project')
        loadProjectCode();
        break;
      }
      default: {
        //console.log('nothing')
      }
    }
  }, true);

  //return an unsubscribe function to clean up when the extension unmounts
  return () => {
    ReactDOM.unmountComponentAtNode(container);
    subscriber();
  }
}

window.constructor.extensions.register(extensionConfig.name, 'projectDetail', render);
