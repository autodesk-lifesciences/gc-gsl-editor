/**
 * The middleware that communicates with the server.
 */ 

const config = require('../../../package.json');

/**
 * Sends the code and corresponding gslc options to run the command on the server.
 * @param {string} editor content
 * @param {Object} gslc argument object
 * @param {string} projectId
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

/**
 * Sends the code and corresponding gslc options to run the command on the server.
 * @param {string} projectId
 */ 
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