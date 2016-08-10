
import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';
const extensionConfig = require('./package.json');
import myState from './state';
//var myState = require('./globals'); //<< globals.js path

const loadProjectCode = (url) => {
  // check in the cache for project code before making a request to the server.
  if (window.gslEditor[window.constructor.api.projects.projectGetCurrentId()].hasOwnProperty('savedCode')) {
    console.log('Using cache');
    window.gslEditor.editorContent = window.gslEditor[window.constructor.api.projects.projectGetCurrentId()].savedCode;
    window.gslEditor.resultContent = '';
    window.gslEditor.statusContent = '';
  }
  else {
    console.log('Making requeists');
    var txtFile = new XMLHttpRequest();
    txtFile.open("GET", url, true);
    txtFile.onreadystatechange = function() {
      if (txtFile.readyState === 4) { 
        if (txtFile.status === 200) { 
          const allText = txtFile.responseText;
          window.gslEditor.editorContent = allText;
          window.gslEditor.resultContent = '';
          window.gslEditor.statusContent = '';
          window.gslEditor[window.constructor.api.projects.projectGetCurrentId()].savedCode = allText;
        }
      }
    }
    txtFile.send(null);
  }
}

function render(container, options) {

  var subscriber = window.constructor.store.subscribe(function (state, lastAction) {
    var current = state.focus.blockIds;
    console.log('The lastAction is ', lastAction);
    if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_SAVE) {
      // save the current content of the editor.
      window.constructor.extensions.files.write(
        window.constructor.api.projects.projectGetCurrentId(),
        extensionConfig.name,
        'project.gsl',
        window.gslEditor.editorContent,
      )
    } else if (lastAction.type === window.constructor.constants.actionTypes.FOCUS_PROJECT ||
      lastAction.type === window.constructor.constants.actionTypes.FOCUS_FORCE_PROJECT) {
        // read code from the server.
        let projectId = '';
        if (lastAction.type === window.constructor.constants.actionTypes.FOCUS_PROJECT)
          projectId = lastAction.projectId;
        else
          projectId = lastAction.project.id;
        window.constructor.extensions.files.read(
          projectId,
          extensionConfig.name,
          'project.gsl')
        .then((response) => {
          if (response.status === 200)
            loadProjectCode(response.url);
        })
        .catch((err) => {
           console.log(err);
        })
      }
    }
  );
  subscriber();
  if (!window.hasOwnProperty('gslEditor')) {
    window.gslEditor = {};
    window.gslEditor[window.constructor.api.projects.projectGetCurrentId()] = {};
  }
  ReactDOM.render(<GSLEditorLayout/>, container);
  //return an unsubscribe function to clean up when the extension unmounts
  return function () {
    subscriber();
  };
}

window.constructor.extensions.register(extensionConfig.name, render);
