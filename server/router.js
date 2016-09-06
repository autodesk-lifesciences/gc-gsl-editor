/**
 * Contains definitions for the GSL server end points.
 */

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import invariant from 'invariant';
import commandExists from 'command-exists';

import { createProjectFilePath, createProjectFilesDirectoryPath } from './utils/project';
import { preprocessArgs, makeArgumentString, getJsonOutFile } from './utils/command';
import { fileRead, directoryContents, makeZip } from './utils/fileSystem';
import { argConfig } from './config';

// Path to the GSL repository
const repoName = 'GSL';
const gslDir = path.resolve(__dirname, EXTENSION_DEPLOY_DIR ? EXTENSION_DEPLOY_DIR : '', repoName);
const gslBinary = path.resolve(gslDir, 'bin/gslc/gslc.exe');
const envVariables = `GSL_LIB=${gslDir}/data/lib`;

const router = express.Router();
const jsonParser = bodyParser.json({
	strict: false,
});

/**
 * Route for running GSL programs on the server
 */ 
router.post('/gslc', jsonParser, (req, res, next) => {
  const input = req.body;
  let content = '';
  if (argConfig.gslFile.hasOwnProperty('preCode')) {
    content += argConfig.gslFile.preCode;
  }
  
  content += input.code;

  let argumentString = null;
  if (input.hasOwnProperty('arguments'))
    argumentString = input.arguments;

  // make sure that mono is installed on the server.
  commandExists('mono', function(err, commandExists) {
    if (err || !commandExists) {
      console.log('ERROR: Could not find mono/fsharp installation on the server to run GSL.');
      const result = {
        'result': 'ERROR: Could not find a valid mono installation on the server to run GSL.',
        'contents': [],
        'status': -1,
      }
      res.status(501).json(result); // Service not implemented
    }
    // make sure that the server is configured with GSL before sending out
    if (!gslDir || !gslBinary || !fs.existsSync(gslDir) || !fs.existsSync(gslBinary)) {
      console.log('ERROR: Someone requested to run GSL code, but this has not been configured.');
      console.log(`gslDir: ${gslDir} and gslBinary: ${gslBinary}`);
      console.log(gslDir, gslBinary, fs.existsSync(gslDir), fs.existsSync(gslBinary));
      const result = {
        'result': 'ERROR: Failed to execute GSL code. The server has not been configured for GSL.',
        'contents': [],
        'status': -1,
      }
      res.status(501).json(result); // Service not implemented
    }
    else {
      const modifiedArgs = preprocessArgs(input.projectId, input.extension, input.args);
      const jsonOutFile =  getJsonOutFile(modifiedArgs);
      if (!argumentString)
        argumentString = makeArgumentString(modifiedArgs);
      const projectFileDir = createProjectFilesDirectoryPath(input.projectId, input.extension);
      const filePath = createProjectFilePath(input.projectId, input.extension, argConfig.gslFile.fileName);
      if (!fs.existsSync(projectFileDir)) {
        fs.mkdirSync(projectFileDir);
      }

      let output = '';
      // write out a file with the code.
      fs.writeFile(filePath, content, function(err) {
        if (err) {
          console.log(err);
        }
        // execute the code
        const command = `${envVariables} mono ${gslBinary} ${argumentString} ${filePath}`;
        console.log('Running: ', command);

        let process;
        try {
          process = exec(`${command}`, (err, stdout, stderr) => {
            if (err) {
              console.log('Invalid GSL code.');
              console.log(err); 
            }
          });
        }
        catch(ex) {
          console.log('The following exception occured while running the gslc command ', ex);
          const result = {
            'result': 'An exception occured while running the gslc command.',
            'contents': [],
            'status': -1,
          }
          res.status(500).json(result);
        }

      if (process) {
       process.stdout.on('data', function(data) {
          output += data;
        });

        process.stderr.on('data', function(data) {
          output += data;
        });

        // find the exit code of the process.
        process.on('exit', function(code) {
          // mask all server paths
          output = output.replace(new RegExp(projectFileDir, 'g'), '<Server_Path>');
          console.log('Child process exited with an exit code of ', code);
          if (code == 0) {
            fs.readFile(jsonOutFile, 'utf8', (err, contents) => {
              if (err) {
                res.status(500).send('Error reading the json file.');
                return;
              }
              const result = {
                'result': output,
                'contents': contents,
                'status': code,
              }
              res.status(200).json(result);
            });
            
            // Create zip packages.
            if (modifiedArgs.hasOwnProperty('--cm'))
              makeZip(projectFileDir, 
                argConfig.downloadableFileTypes['cm'].contentExt, 
                argConfig.downloadableFileTypes['cm'].fileName);

            if (modifiedArgs.hasOwnProperty('--ape'))
              makeZip(projectFileDir,
                argConfig.downloadableFileTypes['ape'].contentExt, 
                argConfig.downloadableFileTypes['ape'].fileName);

            makeZip(projectFileDir, 
              argConfig.downloadableFileTypes['allFormats'].contentExt, 
              argConfig.downloadableFileTypes['allFormats'].fileName);

            if (modifiedArgs.hasOwnProperty('--thumper')) {
              makeZip(projectFileDir, 
                argConfig.downloadableFileTypes['thumper'].contentExt, 
                argConfig.downloadableFileTypes['thumper'].fileName)
                .then(() => {
                  // create the rabit spreadsheet.
                  const inputFile = projectFileDir + '/' + argConfig.fileArguments["--thumper"].fileName + '.rabits.txt';
                  const outputFile = projectFileDir + '/' + argConfig.fileArguments["--thumper"].fileName + '.rabits.xls';
                  console.log(`Copying ${inputFile} to ${outputFile}`);
                  try {
                    fs.createReadStream(inputFile).pipe(fs.createWriteStream(outputFile));
                  }
                  catch(ex) {
                    console.log(`Failed to read ${inputFile} and write to ${outputFile}.`, ex);
                  }
                })
                .catch((ex) => {
                  console.log('An error occured while writing the .xls file', ex);
                });
            }
          }
          else {
            const result = {
              'result': output,
              'contents': [],
              'status': code,
            }
            res.status(422).json(result);
          }
        });
       }
     }); 
    }
  });
});

/**
 * Route for downloading any file type. 
 * (Should be specified in 'downloadableFileTypes' in config.js)
 */
router.get('/download*', function(req, res, next) {

  if (argConfig.downloadableFileTypes.hasOwnProperty(req.query.type)) {
    const fileName = argConfig.downloadableFileTypes[req.query.type].fileName
    const filePath = createProjectFilePath(req.query.projectId, req.query.extension, fileName);
    fs.exists(filePath, function(exists) {
      if (exists) {
        res.header('Content-Type', argConfig.downloadableFileTypes[req.query.type].contentType);
        res.download(filePath, fileName);
      }
      else {
        res.send(`No file of type ${req.query.type} generated yet`);
        res.status(404);
      }
    });
  }
  else {
    res.send('Could not find an appropriate file type to download.');
    res.status(501);
  }
});

/**
 * Route to list the available file downloads.
 */
router.post('/listDownloads', function(req, res, next) {
  // list the available downloads.
  const input = req.body;
  let fileStatus = {};
  const projectFileDir = createProjectFilesDirectoryPath(input.projectId, input.extension);
  Object.keys(argConfig.downloadableFileTypes).forEach(function(key) {
    const filePath = projectFileDir + '/' + argConfig.downloadableFileTypes[key].fileName;
    try {
      fs.accessSync(filePath);
      fileStatus[key] = true;
    }
    catch (e) {
      fileStatus[key] = false;
    }
  });
  res.status(200).json(fileStatus);
});


module.exports = router;
