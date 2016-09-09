/**
 * The middleware that communicates with the server.
 */

const config = require('../../../package.json');

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
