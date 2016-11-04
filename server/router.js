/**
 * Contains definitions for the GSL server end points.
 */

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import commandExists from 'command-exists';

import { createProjectFilePath, createProjectFilesDirectoryPath } from './utils/project';
import { preprocessArgs, makeArgumentString, getJsonOutFile } from './utils/command';
import { makeZip } from './utils/fileSystem';
import { argConfig } from './config';

// Path to the GSL repository
const repoName = 'GSL';
const gslDir = path.resolve(__dirname, process.env.EXTENSION_DEPLOY_DIR ? process.env.EXTENSION_DEPLOY_DIR : '', repoName);
const gslBinary = path.resolve(gslDir, 'bin/gslc/gslc.exe');
const libArg = `--lib ${gslDir}/data/lib`;

const router = express.Router();
const jsonParser = bodyParser.json({
  strict: false,
});

router.post('/gslc', jsonParser, (req, res, next) => {
  // forward the request as it is to the GSL server.
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
        var params = {
          projectId: req.query.projectId,
          extension: 'gslEditor',
          type: req.query.type,
        };

        var query = Object.keys(params)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&');

        const baseUrl = '/download?' 

        var download = function(url, dest) {
          var file = fs.createWriteStream(dest);
          const lib = url.startsWith('https') ? require('https') : require('http');
          var request = lib.get(url, function(response) {
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


module.exports = router;
