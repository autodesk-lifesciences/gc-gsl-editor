import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import path from 'path'
import fs from 'fs';
import { exec, spawn } from 'child_process';
var JSZip = require("jszip");
import invariant from 'invariant';

// TODO: Separate json on moving to webpack
//var argConfig = require('./config.json');
var argConfig = {
  "fileArguments" : {
      "--flat": {
        "arguments" : [ "<filePath>" ],
        "fileName" : "gslOutFlat.txt" 
      },
      "--json" : {
        "arguments": [ "<filePath>" ],
        "fileName": "gslOut.json"
      },
      "--ape" : {
        "arguments" : [ "<outDir>", "<prefix>" ],
        "fileName": "gslOut"
      },
      "--cm" : {
        "arguments" : [ "<outDir>", "<prefix>"],
        "fileName": "gslOut.cm"
      },
      "--primers" : {
        "arguments" : ["<filePath>"],
        "fileName": "gslOut.primers.txt"
      },
      "--docstring" : {
        "arguments" : ["<filePath>"],
        "fileName": "gslOut.doc"
      },
      "--name2id" : {
        "arguments" : ["<filePath>"],
        "fileName": "gslOut.name2id.txt"
      },
        "--thumper" : {
            "arguments" : ["<prefix>"],
            "fileName": "thumperOut"
        }
  },
  "gslFile" : {
    "fileName" : "project.run.gsl"
  },
    "downloadableFileTypes" : {
        "ape" : {
            "fileName": "gslOutApe.zip",
            "contentType": "application/zip",
            "contentExt": ".ape"
        },
        "cm" : {
            "fileName": "gslOutCm.zip",
            "contentType": "application/zip",
            "contentExt": ".cm"
        },
        "thumper" : {
            "fileName" :"gslOutThumper.zip",
            "contentType": "application/zip",
            "contentExt": ".xml|.csv"
        },
        "gsl" : {
            "fileName": "project.gsl",
            "contentType": "text/plain",
            "contentExt": ".gsl"
        },
        "json" : {
            "fileName": "gslOut.json",
            "contentType": "application/json",
            "contentExt": ".json"
        },
        "flat" : {
            "fileName": "gslOutFlat.txt",
            "contentType": "text/plain",
            "contentExt": ".txt"
        }
    }
};

/* Note: It is mandatory to specify the GSL_DIR and GSL_EXE path as the path of 
 the binary file could change based on the project settings. */
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


/* PROJECT FILE PATH RELATED FUNCTIONS */ 
const projectPath = 'projects';
const projectDataPath = 'data';
const projectFilesPath = 'files';

const makePath = (...paths) => {
  if (process.env.STORAGE) {
    return path.resolve(process.env.STORAGE, ...paths);
  }
  return path.resolve(__dirname, '../../../storage/', ...paths);
};
 
const createStorageUrl = (...urls) => {
  const dev = ((process.env.NODE_ENV === 'test') ? 'test/' : '');
  return makePath(dev, ...urls);
};

const createProjectPath = (projectId, ...rest) => {
  invariant(projectId, 'Project ID required');
  return createStorageUrl(projectPath, projectId, ...rest);
};

const createProjectDataPath = (projectId, ...rest) => {
  return createProjectPath(projectId, projectDataPath, ...rest);
};

const createProjectFilesDirectoryPath = (projectId, ...rest) => {
  return createProjectDataPath(projectId, projectFilesPath, ...rest);
};

const createProjectFilePath = (projectId, extension, fileName) => {
  invariant(extension, 'must pass a directory name (extension key)');
  return createProjectFilesDirectoryPath(projectId, extension, fileName);
};


/* HELPER FUNCTIONS */ 

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
          console.log('THE DIRECTORY MADE IS ', modifiedArgs[key][argCounter]);
        }
        argCounter++;
      }
    }
  }
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

/* Read a file, optionally parse Json */
const fileRead = (path, jsonParse = true) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, result) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return reject(err);
        }
        return reject(err);
      }
      const parsed = !!jsonParse ? parser(result) : result;
      resolve(parsed);
    });
  });
};

/* Return the contents of the directory */
const directoryContents = (path, ext='') => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, contents) => {
      if (err) {
        return reject(err);
      }
      function checkApe(fileName) {
        if (ext === '')
          return true;
        return fileName.endsWith(ext);
      }
      resolve(contents.filter(checkApe));
    });
  });
};

/* Make a zip package */
const makeZip = (path, fileType) => {
  var zip = new JSZip();
  directoryContents(path, argConfig.downloadableFileTypes[fileType].contentExt)
  .then(contents => {
    const promise = Promise.resolve('');
    // read and add all the files into the zip file.
    for (var fileName of contents) {
      const fileContents = fileRead(path + '/' + fileName, false);
      zip.file(fileName, fileContents);
    }
    zip
    .generateNodeStream({type:'nodebuffer', streamFiles:true})
    .pipe(fs.createWriteStream(path + '/' + argConfig.downloadableFileTypes[fileType].fileName))
    .on('finish', function () {
      console.log('Written out the .zip file');
    });
  });
};

/* ROUTES */
/* Router for running GSL programs on the server */
router.post('/gslc', jsonParser, (req, res, next) => {
  const input = req.body;
  let content = "#refgenome S288C \n" + input.code; // TODO: Make configurable

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
    if (!fs.existsSync(projectFileDir)){
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
          });
          makeZip(projectFileDir, 'ape');
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

/* Download any data file */
router.get('/download*', function(req, res, next) {

  if (argConfig.downloadableFileTypes.hasOwnProperty(req.query.type)) {
    console.log("Got a request to download the type: ", argConfig.downloadableFileTypes[req.query.type]);
    const fileName = argConfig.downloadableFileTypes[req.query.type].fileName
    const filePath = createProjectFilePath(req.query.projectId, req.query.extension, fileName);
    res.header("Content-Type", argConfig.downloadableFileTypes[req.query.type].contentType);
    res.download(filePath, fileName);
  }
  else {
    res.send('Could not find an appropriate file type to download.');
    res.send(501);
  }
});


module.exports = router;