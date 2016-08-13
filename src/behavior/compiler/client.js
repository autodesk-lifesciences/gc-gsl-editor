var config = require('../../../package.json');
var gslState = require('../../../globals');

const getProjectFilesDir = (projectId) => {
  window.constructor.extensions.files.read(
      window.constructor.api.projects.projectGetCurrentId(),
      config.name,
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
        gslState.editorContent = '';
        gslState.resultContent = '';
        gslState.statusContent = '';
        ReactDOM.render(<GSLEditorLayout/>, container);
    });
}

// Sends the code and corresponding gslc options to run the command on the server.
export const run = (data, args, projectId) => {
  // concatenate arguments
  let argumentString = '';
  for (let key of Object.keys(args)){
    // create the option string.
    argumentString += " " + key + " ";
    argumentString += args[key].join(" ");
  }
  const payload = {
    'code': data,
    'arguments': argumentString,
    'projectId': projectId,
    'extension': config.name,
    'args': args,
    'projectFileDir' : '/tmp/'
  };

  const stringified = JSON.stringify(payload);
  // send a post request to the server and pring out the results in the console.
  return fetch('/extensions/api/' + config.name + '/gslc', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    },
    body: stringified,
  })
  .then(resp => resp.json())
  .then(function(data) {
    console.log(data);
    return data;
  });
};