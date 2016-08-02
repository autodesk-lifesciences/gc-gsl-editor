import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import path from 'path'
import fs from 'fs';
import { exec, spawn } from 'child_process';

import { createProjectFilePath, createProjectFilesDirectoryPath } from '../../../server/utils/filePaths';
var argConfig = require('./config.json');

// read the environment variables and set the GSL directory.
// Note: It is mandatory to specify the GSL_EXE path as the path of 
// the binary file could change based on the project settings.
let gslDir, gslBinary;
if (process.env.GSL_DIR)
  gslDir = process.env.GSL_DIR;
if (process.env.GSL_EXE)
  gslBinary = process.env.GSL_EXE;

const envVariables = `GSL_LIB=${gslDir}/data/lib`;
const router = express.Router();
const jsonParser = bodyParser.json({
	strict: false,
}); 


/* Preprocess arguments to find the arguments that create files */
const preprocessArgs = (projectId, extensionKey, args) => {
  let modifiedArgs = args;
  for (let key of Object.keys(modifiedArgs)) {
    if (argConfig.fileArguments.hasOwnProperty(key)) {
      // Get or create a type for this file and modify the argument string.
      let argCounter = 0;
      for (let argType of argConfig.fileArguments[key].arguments) {
        if (argType === '<filePath>') {
          modifiedArgs[key][argCounter] = createProjectFilePath(projectId, extensionKey, argConfig.fileArguments[key].fileName);
        }
        else if (argType === '<prefix>') {
          modifiedArgs[key][argCounter] = argConfig.fileArguments[key].fileName;
        }
        else if (argType === '<outDir>') {
          modifiedArgs[key][argCounter] = createProjectFilesDirectoryPath(projectId, extensionKey);
        }
        argCounter++;
      }
    }
  }
  console.log('The modified args are ', modifiedArgs);
  return modifiedArgs;
}

/* Make argument string */
const makeArgumentString = (args) => {
  let argumentString = '';
  for (let key of Object.keys(args)){
    // create the option string.
    argumentString += " " + key + " ";
    argumentString += args[key].join(" ");
  }
  return argumentString;
}

/* Get the JSON out file path */
const getJsonOutFile = (args) => {
  const json = '--json';
  if (args.hasOwnProperty(json)) {
    return args[json][0];
  }
}

/* Router for running GSL programs on the server */
router.post('/gslc', jsonParser, (req, res, next) => {
  const input = req.body;
  //let content = "#refgenome S288C \n" + input.code;
  let content = input.code;
  let argumentString = input.arguments;

  // make sure that the server is configured with GSL before sending out
  if (!gslDir || !gslBinary || !fs.existsSync(gslDir) || !fs.existsSync(gslBinary)) {
    console.log("ERROR: Someone requested to run GSL code, "+
      "but this has not been configured. Please set valid 'GSL_DIR' and 'GSL_EXE' environment variables.");
    const result = {
      'result' : "Failed to execute GSL code. The server has not been configured for GSL.",
      'contents': [],
      'status' : -1,
    }
    res.status(501).json(result); // Service not implemented
  } 
  else {
    const modifiedArgs = preprocessArgs(input.projectId, input.extension, input.args);
    const jsonOutFile =  getJsonOutFile(modifiedArgs);
    argumentString = makeArgumentString(modifiedArgs);
    const projectFileDir = createProjectFilesDirectoryPath(input.projectId, input.extension);
    const filePath = createProjectFilePath(input.projectId, input.extension, argConfig.gslFile.fileName);
    let output = '';
    // write out a file with the code.
    fs.writeFile(filePath, content, function(err) {

      if (err) {
        console.log(err);
      }
      // execute the code
      const command = `${envVariables} mono ${gslBinary} ${argumentString} ${filePath}`;
      console.log('Running: ', command);
      const process = exec(`${command}`, (err, stdout, stderr) => {
        if (err) {
          console.log('The GSL command encountered an error:');
          console.log(err);
        }       
      });

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
              'result' : output,
              'contents': contents,
              'status' : code,
            }
            res.status(200).json(result);
          })
        }
        else {
          const result = {
            'result' : output,
            'contents' : [],
            'status' : code,
          }
          res.status(422).json(result);
        }
      });
    }); 
  }
});

module.exports = router;