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
        "fileName": "gslOut"
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
        "arguments" : ["<filePath>"],
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
      "contentExt": ".ape$"
    },
    "cm" : {
      "fileName": "gslOutCm.zip",
      "contentType": "application/zip",
      "contentExt": ".cx5$"
    },
    "thumper" : {
      "fileName" :"gslOutThumper.zip",
      "contentType": "application/zip",
      "contentExt": "^thumperOut"
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
    },
    "rabitXls" : {
      "fileName": "thumperOut.rabits.xls",
      "contentType": "application/vnd.ms-excel",
      "contentExt": ".xls"
    }
  }
};

const repoName = 'GSL';
const gslDir = path.resolve(__dirname, repoName);
const gslBinary = path.resolve(gslDir, 'bin/gslc/gslc.exe');
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
  return path.resolve(process.cwd(), 'storage', ...paths);
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
const directoryContents = (path, pattern='') => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, contents) => {
      if (err) {
        return reject(err);
      }
      const reg = new RegExp(pattern);
      resolve(contents.filter((item) => {
        return reg.test(item);
      }));
    });
  });
}

/* Make a zip package */
const makeZip = (path, fileType) => {
  return new Promise((resolve, reject) => {
    var zip = new JSZip();
    directoryContents(path, argConfig.downloadableFileTypes[fileType].contentExt)
    .then(directoryContents => Promise.all(
      directoryContents.map(fileName => {
        return fileRead(path + '/' + fileName, false).then(fileContents => {
          zip.file(fileName, fileContents);
        });
      })
    ))
    .then(() => {
      zip.generateNodeStream({type:'nodebuffer', streamFiles:true})
      .pipe(fs.createWriteStream(path + '/' + argConfig.downloadableFileTypes[fileType].fileName))
      .on('finish', function () {
        console.log(`Written out the ${fileType} .zip file`);
        resolve(zip);
      });
    })
    .catch((err) => {
      console.log('Error making zip for ' + fileType);
      console.log(err);
      reject(err);
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
    console.log("ERROR: Someone requested to run GSL code, but this has not been configured.");
    console.log(`gslDir: ${gslDir} and gslBinary: ${gslBinary}`);
    console.log(gslDir, gslBinary, fs.existsSync(gslDir), fs.existsSync(gslBinary));
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
          'result' : 'An exception occured while running the gslc command.',
          'contents' : [],
          'status' : -1,
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
              'result' : output,
              'contents': contents,
              'status' : code,
            }
            res.status(200).json(result);
          });
          //actually make the zips (assume time to click)
          if (modifiedArgs.hasOwnProperty('--cm'))
            makeZip(projectFileDir, 'cm');

          if (modifiedArgs.hasOwnProperty('--ape'))
            makeZip(projectFileDir, 'ape');

          if (modifiedArgs.hasOwnProperty('--thumper')) {
            makeZip(projectFileDir, 'thumper')
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
            'result' : output,
            'contents' : [],
            'status' : code,
          }
          res.status(422).json(result);
        }
      });
    }
    }); 
  }
});

/* Download any data file */
router.get('/download*', function(req, res, next) {

  if (argConfig.downloadableFileTypes.hasOwnProperty(req.query.type)) {
    const fileName = argConfig.downloadableFileTypes[req.query.type].fileName
    const filePath = createProjectFilePath(req.query.projectId, req.query.extension, fileName);
    fs.exists(filePath, function(exists) {
      if (exists) {
        res.header("Content-Type", argConfig.downloadableFileTypes[req.query.type].contentType);
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

/* Get information of available file types of downloads */
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
    catch(e) {
      fileStatus[key] = false;
    }
  });
  res.status(200).json(fileStatus);
});


module.exports = router;