
import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';
const extensionConfig = require('./package.json');
//import myState from './state';
var myState = require('./globals'); //<< globals.js path

const loadProjectCode = (url) => {
  // check in the cache for project code before making a request to the server.
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) { 
        if (xhr.status === 200) { 
          const allText = xhr.responseText;
          myState.editorContent = allText;
          window.gslEditor.editorContent = allText;
          window.gslEditor.resultContent = '';
          window.gslEditor.statusContent = '';
          resolve();
        }
      }
    }
    xhr.send(null);
  });
  }

function render(container, options) {
  
  var subscriber = window.constructor.store.subscribe(function (state, lastAction) {
    var current = state.focus.blockIds;
    //console.log('The lastAction is ', lastAction);
    if (!window.hasOwnProperty('gslEditor')) {
      window.gslEditor = {};
    }    
    if (lastAction.type === window.constructor.constants.actionTypes.DETAIL_VIEW_SELECT_EXTENSION) {
          if (!window.gslEditor.hasOwnProperty('prevProject') || window.gslEditor.prevProject !== window.constructor.api.projects.projectGetCurrentId()) {
          // read code from the server.
          window.constructor.extensions.files.read(
            window.constructor.api.projects.projectGetCurrentId(),
            extensionConfig.name,
            'project.gsl')
          .then((response) => {
            if (response.status === 200) { 
              loadProjectCode(response.url)
              .then(()=> {
                    ReactDOM.render(<GSLEditorLayout/>, container);
              });
            }
          })
          .catch((err) => {
              window.gslEditor.editorContent = '';
              window.gslEditor.resultContent = '';
              window.gslEditor.statusContent = '';
              ReactDOM.render(<GSLEditorLayout/>, container);
          });
        } else {
            ReactDOM.render(<GSLEditorLayout/>, container);
            //console.log("Done re-rendering");
        }
        window.gslEditor.prevProject = window.constructor.api.projects.projectGetCurrentId();
        console.log('Setting prevProject: ' , window.gslEditor.prevProject);
    } else {
        ReactDOM.render(<GSLEditorLayout/>, container);
        //console.log("Done rendering");
    }
    if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_SAVE) {
      // save the current content of the editor.
      window.constructor.extensions.files.write(
        window.constructor.api.projects.projectGetCurrentId(),
        extensionConfig.name,
        'project.gsl',
        window.gslEditor.editorContent,
      )
      console.log('Saving GSL Code.');
    } else if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_OPEN) {
        // read code from the server.
        window.constructor.extensions.files.read(
          window.constructor.api.projects.projectGetCurrentId(),
          extensionConfig.name,
          'project.gsl')
        .then((response) => {
          if (response.status === 200) {
            loadProjectCode(response.url);
          }
        })
        .catch((err) => {
           console.log(err);
        });
      }
    }, true
  );
  if (!window.hasOwnProperty('gslEditor')) {
    window.gslEditor = {};
  }
  //return an unsubscribe function to clean up when the extension unmounts
  return function () {
    if (!window.hasOwnProperty('gslEditor')) {
    window.gslEditor = {};
    }
    subscriber();
  };
}

window.constructor.extensions.register(extensionConfig.name, render);
