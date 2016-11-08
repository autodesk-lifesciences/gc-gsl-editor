/**
 * The middleware that communicates with the server.
 */

const config = require('../../../package.json');
const gslState = require('../../../globals');
const defaultEditorContent = '#refgenome S288C\n// #refgenome BY4741\n// #refgenome BY4742\n\n#name NewGSLConstruct\n';
/**
 * Sends the code and corresponding gslc options to run the command on the server.
 * @param {string} editor content
 * @param {Object} gslc argument object
 * @param {string} projectId
 * @return {string} resultData
 */
export const run = (data, args, projectId) => {
  const payload = {
    'code': data,
    'projectId': projectId,
    'extension': config.name,
    'args': args,
  };

  const stringified = JSON.stringify(payload);

  return fetch('/extensions/api/' + config.name + '/gslc', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: stringified,
  })
  .then(resp => resp.json())
  .then((data) => {
    console.log(data);
    return data;
  })
  .catch((err) => {
    console.log('Request timed out:', err);
    return {
      'result': 'Waited too long but could not process the request.',
      'status': 1,
      'contents': [],
    };
  });
};

/**
 * Sends the code and corresponding gslc options to run the command on the server.
 * @param {string} projectId
 * @result {Object} List of downloadable file types and th
 */
export const getAvailableDownloadList = (projectId) => {
  const payload = {
    'projectId': projectId,
    'extension': config.name,
  };

  const stringified = JSON.stringify(payload);
  return fetch('/extensions/api/' + config.name + '/listDownloads', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: stringified,
  })
  .then(resp => resp.json())
  .then((data) => {
    return data;
  });
};

/**
 * Load GSL code associated with the project into the editor.
 * @param {string} url of the GSL file in the project.
 */
export const loadProjectCode = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const allText = xhr.responseText;
          gslState.editorContent = allText;
          gslState.refreshDownloadList = false;
          gslState.resultContent = '';
          gslState.statusContent = '';
          const projectId = window.constructor.api.projects.projectGetCurrentId();
          if (!gslState.hasOwnProperty(projectId)) {
            gslState[projectId] = {};
          }
          gslState[projectId].savedCode = gslState.editorContent;
          resolve();
        }
      }
    };
    xhr.send(null);
  });
};

/**
 * Load the GSL to construct metadata (stored on the server) into the project.
 * @param {string} url of the metadata settings file.
 */
export const loadSettings = (url) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const allText = xhr.responseText;
        const jsonSettings = JSON.parse(allText);
        gslState.gslConstructs = jsonSettings.constructs;
      }
    }
  };
  xhr.send(null);
};

/**
 * Load editor defaults.

 */
export const loadDefaults = () => {
  return new Promise((resolve, reject) => {
    gslState.editorContent = defaultEditorContent;
    gslState.resultContent = '';
    gslState.statusContent = '';
    gslState.refreshDownloadList = true;
    // write an empty file.
    window.constructor.extensions.files.write(
      window.constructor.api.projects.projectGetCurrentId(),
      config.name,
      'project.run.gsl',
      ''
    ).then(()=> {
      resolve();
    })
    .catch((err) => {
      console.log(err);
      reject(err);
    });
  });
};

/**
 * Save Project code.
 */
export const saveProjectCode = () => {
  window.constructor.extensions.files.write(
    window.constructor.api.projects.projectGetCurrentId(),
    config.name,
    'project.gsl',
    gslState.editorContent
  )
  .then(() => {
    console.log('Saved GSL Code.');
    gslState.refreshDownloadList = true;
  })
  .catch((err) => {
    console.log('Failed to save GSL Code');
    console.log(err);
  });
};

/*
 * Rule to determine if the result message indicates a primer generation failure.
 */ 
export const isPrimerFailure = (resultMessage) => {
  const errorlist = [
    '.*ERROR: .* can\'t find suitable.* default.* part diag.* Linker.*',
    '.*out.*of.*linkers.*',
  ];

  for (const error of errorlist) {
    const re = new RegExp(error);
    const result = resultMessage.match(re);
    if (result) {
      return (resultMessage.match(re).length > 0);
    }   
  }
  return false;
};

/*
 * Removes the primer and thumper arguments.
 */ 
export const removePrimerThumperArgs = (compilerArgs) => {
  var modifiedArgs = Object.assign({}, compilerArgs);
  if (modifiedArgs.hasOwnProperty('--primers')) {
    delete modifiedArgs['--primers'];
  }

  if (modifiedArgs.hasOwnProperty('--thumper')) {
    delete modifiedArgs['--thumper'];
  }

  if (!modifiedArgs.hasOwnProperty('--no-primers')) {
    modifiedArgs['--noprimers'] = [];
  }
  return modifiedArgs;
};
