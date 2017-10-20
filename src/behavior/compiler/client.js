/**
 * The middleware that communicates with the server.
 */

const config = require('../../../package.json');
const gslState = require('../../globals');

const defaultEditorContent = '#refgenome S288C\n// #refgenome BY4741\n// #refgenome BY4742\n\n#name NewGSLConstruct\n';

// save the project code in the GSL state
// use saveProjectCode to write files and actually persist
export const saveProjectCodeLocally = (projectId, code) => {
  if (!gslState.hasOwnProperty(projectId)) {
    gslState[projectId] = {};
  }
  gslState[projectId].savedCode = code;
};

export const writeProjectFile = (projectId, code, fileName = 'project.gsl') =>
  window.constructor.extensions.files.write(
    projectId,
    config.name,
    fileName,
    code,
  );

/**
 * Sends the code and corresponding gslc options to run the command on the server.
 * @param {string} code current Code
 * @param {Object} args argument object
 * @param {string} projectId
 * @return {string} resultData
 */
export const run = (code, args, projectId) => {
  const script = `
#!/usr/bin/env sh
mkdir /outputs
mono /gslc/bin/Gslc.exe --lib /gslc/gslc_lib --flat /outputs/gslOutFlat.txt --json /outputs/gslOut.json --primers /outputs/gslOut.primers.txt --ape /outputs gslOut --cm /outputs gslOut /inputs/project.gsl
`;

  const payload = {
    CreateContainerOptions: {
      Image: 'quay.io/bionano/gslc:ae240582',
      Cmd: ['/bin/sh', '/inputs/script.sh'],
      EntryPoint: [], // Otherwise it assumes the Gclc binary
    },
    inputs: {
      'script.sh': script,
      'project.gsl': code,
    },
    parameters: {
      maxDuration: 20000,
    },
    meta: {
      projectId, // Unnecessary, but could be useful for logging
      type: 'gsl', // So we can group all gsl jobs in kibana
    },
  };

  return fetch(`/compute/${projectId}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  })
    .then(resp => resp.json())
    .catch((err) => {
      console.error('Request timed out:', err);
      return {
        result: `Unable to process the request:${err}`,
        status: 1,
        contents: [],
      };
    });
};

//use this after saving, as it also sets the last saved code
// projectId *should* be passed unless
// pass code = null to avoid setting defaults
export const setProjectCode = (forceProjectId, code, otherState = {}) => {
  const projectId = forceProjectId || window.constructor.api.projects.projectGetCurrentId();

  let codeNotNull = code;
  if (!code) {
    console.error('attempting to set empty project code; loading defaults...');
    codeNotNull = defaultEditorContent;
    otherState.refreshDownloadList = true;
  }

  Object.assign(gslState, {
    editorContent: codeNotNull,
    refreshDownloadList: false,
    resultContent: '',
    statusContent: '',
  }, otherState);

  saveProjectCodeLocally(projectId, codeNotNull);

  return codeNotNull;
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
  return writeProjectFile(projectId, defaultEditorContent);
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
  //saveProjectCodeLocally(projectId, nextCode); //setProjectCode calls this
  setProjectCode(projectId, nextCode);

  // console.log('request to save code:\n', nextCode);

  //no reason to chain these, or write when no changes have been made
  const promises = ((nextCode === null) || (nextCode === '') || (lastCode === nextCode)) ?
    [] : [
      //write the project file, if necessary
      writeProjectFile(projectId, nextCode)
        .then(project => {
          console.log('Saved GSL Code.');
          Object.assign(gslState, { refreshDownloadList: true });
          return project;
        }),
    ];

  return Promise.all(promises)
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
