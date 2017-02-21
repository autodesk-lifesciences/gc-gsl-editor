/**
 * The middleware that communicates with the server.
 */

const config = require('../../../package.json');
const gslState = require('../../../globals');

const defaultEditorContent = '#refgenome S288C\n// #refgenome BY4741\n// #refgenome BY4742\n\n#name NewGSLConstruct\n';

// save the project code in the GSL state
// use saveProjectCode to write files and actually persist
export const saveProjectCodeLocally = (projectId, code) => {
  if (!gslState.hasOwnProperty(projectId)) {
    gslState[projectId] = {};
  }
  gslState[projectId].savedCode = code;
};

/**
 * Sends the code and corresponding gslc options to run the command on the server.
 * @param {string} code current Code
 * @param {Object} args argument object
 * @param {string} projectId
 * @return {string} resultData
 */
export const run = (code, args, projectId) => {
  const extension = config.name;

  const payload = {
    code,
    projectId,
    args,
    extension,
  };

  const stringified = JSON.stringify(payload);

  return fetch(`/extensions/api/${extension}/gslc`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: stringified,
  })
    .then(resp => resp.json())
    .catch((err) => {
      console.log('Request timed out:', err);
      return {
        'result': 'Unable to process the request:' + err,
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

//use this after saving, as it also sets the last saved code
// projectId *should* be passed unless
// pass code = null to avoid setting defaults
export const setProjectCode = (forceProjectId, code, otherState = {}) => {
  const projectId = forceProjectId || window.constructor.api.projects.projectGetCurrentId();

  if (!code) {
    console.error('attempting to set empty project code; loading defaults...');
    return loadDefaults(projectId);
  }

  Object.assign(gslState, {
    editorContent: code,
    refreshDownloadList: false,
    resultContent: '',
    statusContent: '',
  }, otherState);

  saveProjectCodeLocally(projectId, code);

  return code;
};

/**
 * Load GSL code associated with the project into the editor.
 */
export const loadProjectCode = (forceProjectId) => {
  // console.log('loadProjectCode', forceProjectId);
  const projectId = forceProjectId || window.constructor.api.projects.projectGetCurrentId();
  return window.constructor.extensions.files.read(
    projectId,
    config.name,
    'project.gsl'
  )
    .then(code => setProjectCode(projectId, code));
};

/**
 * Load editor defaults.
 */
export const loadDefaults = (projectId) => {
  // console.log('loading defaults...');
  setProjectCode(projectId, defaultEditorContent, {
    refreshDownloadList: true,
  });

  // Adds the file to the project files, and marks it GSL
  // write the default file
  return window.constructor.extensions.files.write(
    projectId,
    config.name,
    'project.gsl',
    defaultEditorContent
  );
};

/**
 * Save Project code on the GSL server (needed for downloads)
 */
export const writeRemote = (projectId, extension, fileName, contents) => {
  const payload = {
    projectId,
    extension,
    fileName,
    contents,
  };

  const stringified = JSON.stringify(payload);
  return fetch('/extensions/api/' + extension + '/writeRemote', {
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
    })
    .catch((err) => {
      console.log('Request timed out:', err);
      return {
        'result': 'Unable to save the file.',
        'status': 1,
      };
    });
};

/**
 * Save Project code.
 * Only saves to constructor if it has changed. will always save to remote server
 */
export const saveProjectCode = (forceProjectId, forceNextCode) => {
  const projectId = forceProjectId || window.constructor.api.projects.projectGetCurrentId();
  const nextCode = forceNextCode || gslState.editorContent;
  const lastCode = typeof gslState[projectId] === 'object' ?
    gslState[projectId].savedCode :
    null;

  // make sure the editor code content is up to date, and save the code locally in our state
  // run this now, not after the write resolves, e.g. if we are opening another project
  setProjectCode(projectId, nextCode);
  //saveProjectCodeLocally(projectId, nextCode); //setProjectCode calls this

  // console.log('request to save code:\n', nextCode);
  const promise = ((nextCode == null) || (nextCode === '') || (lastCode === nextCode)) ?
    Promise.resolve(null) :
    window.constructor.extensions.files.write(
      projectId,
      config.name,
      'project.gsl',
      nextCode
    )
      .then(project => {
        console.log('Saved GSL Code.');

        Object.assign(gslState, {
          refreshDownloadList: true,
        });

        return project;
      });

  return promise
    .then(() => {
      // Save code to the remote gsl server.
      return writeRemote(
        projectId,
        config.name,
        'project.gsl',
        nextCode
      )
        .catch((err) => {
          console.log('Failed to save GSL code remotely');
          console.log(err);
        });
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
  const modifiedArgs = Object.assign({}, compilerArgs);
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
