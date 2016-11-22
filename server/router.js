/**
 * Contains definitions for the GSL server end points.
 */

import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

import { createProjectFilePath } from './utils/project';
import { argConfig } from './config';

const router = express.Router();
const jsonParser = bodyParser.json({
  strict: false,
});

router.post('/gslc', jsonParser, (req, res, next) => {
  const input = req.body;
  const payload = {
    'code': input.code,
    'projectId': input.projectId,
    'extension': input.extension,
    'args': input.args,
  };

  fetch(argConfig.externalServer.url + '/gslc', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  })
  .then((resp) => {
    return resp.json();
  })
  .then((data) => {
    const result = {
      'result': data.result,
      'contents': data.contents,
      'status': data.status,
    };
    res.status(200).json(result);
  })
  .catch((err) => {
    const result = {
      'result': err.stack,
      'contents': [],
      'status': -1,
    };
    console.log('Encountered an error:');
    console.log(err.stack);
    res.status(422).json(result);
  });
});


/**
 * Route for downloading any file type.
 * (Should be specified in 'downloadableFileTypes' in config.js)
 */
router.get('/download*', (req, res, next) => {
  if (argConfig.downloadableFileTypes.hasOwnProperty(req.query.type)) {
    const fileName = argConfig.downloadableFileTypes[req.query.type].fileName;
    const filePath = createProjectFilePath(req.query.projectId, req.query.extension, fileName);
    const useLocalStorage = false;
    fs.exists(filePath, (exists) => {
      if (exists && useLocalStorage) {
        res.header('Content-Type', argConfig.downloadableFileTypes[req.query.type].contentType);
        res.download(filePath, fileName);
      } else {
        const params = {
          projectId: req.query.projectId,
          extension: req.query.extension,
          type: req.query.type,
        };

        const query = Object.keys(params)
          .map(attr => encodeURIComponent(attr) + '=' + encodeURIComponent(params[attr]))
          .join('&');

        const baseUrl = '/download?';

        const download = function(url, dest) {
          const file = fs.createWriteStream(dest);
          const lib = url.startsWith('https') ? require('https') : require('http');
          lib.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
              res.header('Content-Type', argConfig.downloadableFileTypes[req.query.type].contentType);
              res.download(filePath, fileName);
              file.close();
            });
          }).on('error', function(err) {
            //fs.unlink(dest);
            console.log('An error occured while downloading');
            console.log(err.stack);
            res.send(`No file of type ${req.query.type} generated yet`);
            res.status(404);
          });
        };
        download(argConfig.externalServer.url + baseUrl + query, filePath );
      }
    });
  } else {
    res.send('Could not find an appropriate file type to download.');
    res.status(501);
  }
});


/**
 * Route to list the available file downloads.
 */
router.post('/listDownloads', (req, res, next) => {
  const input = req.body;
  const payload = {
    'projectId': input.projectId,
    'extension': input.extension,
  };
  const stringified = JSON.stringify(payload);
  fetch(argConfig.externalServer.url + '/listDownloads', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: stringified,
  })
  .then(resp => resp.json())
  .then((data) => {
    res.status(200).json(data);
  });
});

/**
 * Route of save a remote file.
 */
router.post('/writeRemote', jsonParser, (req, res, next) => {
  const input = req.body;
  const payload = {
    'fileName': input.fileName,
    'projectId': input.projectId,
    'extension': input.extension,
    'contents': input.contents,
  };

  fetch(argConfig.externalServer.url + '/writeRemote', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(payload),
  })
  .then((resp) => {
    return resp.json();
  })
  .then((data) => {
    const result = {
      'status': data.status,
    };
    res.status(200).json(result);
  })
  .catch((err) => {
    const result = {
      'result': err.stack,
      'contents': [],
      'status': -1,
    };
    console.log('Encountered an error:');
    console.log(err.stack);
    res.status(422).json(result);
  });
});

module.exports = router;
