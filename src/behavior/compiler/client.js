const config = require('../../../package.json');

// Sends the code and corresponding gslc options to run the command on the server.
export const run = (data, args, projectId) => {
  // concatenate arguments
  let argumentString = '';
  for (const key of Object.keys(args)) {
    // create the option string.
    argumentString += ' ' + key + ' ';
    argumentString += args[key].join(' ');
  }
  const payload = {
    'code': data,
    'arguments': argumentString,
    'projectId': projectId,
    'extension': config.name,
    'args': args,
    'projectFileDir' : '/tmp/',
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

/* Retrieves the file types available for download for a project */
export const getAvailableDownloadList = (projectId) => {
  const payload = {
    'projectId': projectId,
    'extension': config.name
  };

  const stringified = JSON.stringify(payload);
  return fetch('/extensions/api/' + config.name + '/listDownloads', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    },
    body: stringified,
  })
  .then(resp => resp.json())
  .then(function(data) {
    return data;
  });
};