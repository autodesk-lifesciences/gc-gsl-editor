import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';
const extensionConfig = require('./package.json');
const defaultEditorContent = '#name NewGSLConstruct\n';
let gslState = require('./globals');

const loadProjectCode = (url) => {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const allText = xhr.responseText;
          gslState.editorContent = allText;
          gslState.refreshDownloadList = false;
          gslState.resultContent = '';
          gslState.statusContent = '';
          const projectId = window.constructor.api.projects.projectGetCurrentId();
          if (!gslState.hasOwnProperty(projectId)) 
            gslState[projectId] = {}
          gslState[projectId].savedCode = gslState.editorContent;
          resolve();
        }
      }
    }
    xhr.send(null);
  });
}

const loadSettings = (url) => {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const allText = xhr.responseText;
        const jsonSettings = JSON.parse(allText);
        gslState.gslConstructs = jsonSettings.constructs;
      }
    }
  }
  xhr.send(null);
}

const loadDefaults = (container) => {
  gslState.editorContent = defaultEditorContent;
  gslState.resultContent = '';
  gslState.statusContent = '';
  gslState.refreshDownloadList = true;
  // write an empty file.
  window.constructor.extensions.files.write(
    window.constructor.api.projects.projectGetCurrentId(),
    extensionConfig.name,
    'project.run.gsl',
    ''
  ).then(()=> {
     ReactDOM.render(<GSLEditorLayout/>, container);
   })
  .catch((err) => {
    console.log(err);
    ReactDOM.render(<GSLEditorLayout/>, container);
  });  
}

function render(container, options) {

  var subscriber = window.constructor.store.subscribe(function (state, lastAction) {
    if (lastAction.type === window.constructor.constants.actionTypes.DETAIL_VIEW_SELECT_EXTENSION) {
      if (!gslState.hasOwnProperty('prevProject') || gslState.prevProject !== window.constructor.api.projects.projectGetCurrentId()) {
        // read the list of files on present on the server
        let fileList = [];
        window.constructor.extensions.files.list(
          window.constructor.api.projects.projectGetCurrentId(),
          extensionConfig.name)
        .then((response) => {
          fileList = response;
          if (fileList.indexOf('project.gsl') >= 0) {
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
                if (fileList.indexOf('settings.json') >= 0) {
                  window.constructor.extensions.files.read(
                    window.constructor.api.projects.projectGetCurrentId(),
                    extensionConfig.name,
                    'settings.json')
                  .then((response) => {
                    if (response.status === 200) {
                      loadSettings(response.url);
                    }
                    else {
                      gslState.gslConstructs = [];
                    }
                  })
                  .catch((err) => {
                  });
                }
              }
            })
            .catch((err) => {
              loadDefaults(container);
            });
          } else {
            loadDefaults(container);
          }
        })
        .catch((err) => {
          loadDefaults(container);
        });
      } else {
          ReactDOM.render(<GSLEditorLayout/>, container);
      }
        gslState.prevProject = window.constructor.api.projects.projectGetCurrentId();
    }
    else if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_SAVE) {
      // save the current content of the editor.
      window.constructor.extensions.files.write(
        window.constructor.api.projects.projectGetCurrentId(),
        extensionConfig.name,
        'project.gsl',
        gslState.editorContent,
      )
      .then(() => {
        console.log('Saved GSL Code.');
        gslState.refreshDownloadList = true;
      })
      .catch((err) => {
        console.log('Failed to save GSL Code');
        console.log(err);
      });
    }
    else if (lastAction.type === window.constructor.constants.actionTypes.PROJECT_OPEN) {
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
  }, true);

  //return an unsubscribe function to clean up when the extension unmounts
  return subscriber;
}

window.constructor.extensions.register(extensionConfig.name, render);
