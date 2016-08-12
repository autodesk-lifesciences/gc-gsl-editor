var config = require('../../../package.json');

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
    //console.log(JSON.parse(data.contents));
    return data;
  });
};