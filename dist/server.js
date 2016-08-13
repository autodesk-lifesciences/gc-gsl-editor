'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var JSZip = require("jszip");


// TODO: Separate json on moving to webpack
//var argConfig = require('./config.json');
var argConfig = {
  "fileArguments": {
    "--flat": {
      "arguments": ["<filePath>"],
      "fileName": "gslOutFlat.txt"
    },
    "--json": {
      "arguments": ["<filePath>"],
      "fileName": "gslOut.json"
    },
    "--ape": {
      "arguments": ["<outDir>", "<prefix>"],
      "fileName": "gslOut"
    },
    "--cm": {
      "arguments": ["<outDir>", "<prefix>"],
      "fileName": "gslOut.cm"
    },
    "--primers": {
      "arguments": ["<filePath>"],
      "fileName": "gslOut.primers.txt"
    },
    "--docstring": {
      "arguments": ["<filePath>"],
      "fileName": "gslOut.doc"
    },
    "--name2id": {
      "arguments": ["<filePath>"],
      "fileName": "gslOut.name2id.txt"
    },
    "--thumper": {
      "arguments": ["<prefix>"],
      "fileName": "thumperOut"
    }
  },
  "gslFile": {
    "fileName": "project.run.gsl"
  },
  "downloadableFileTypes": {
    "ape": {
      "fileName": "gslOutApe.zip",
      "contentType": "application/zip",
      "contentExt": ".ape"
    },
    "cm": {
      "fileName": "gslOutCm.zip",
      "contentType": "application/zip",
      "contentExt": ".cm"
    },
    "thumper": {
      "fileName": "gslOutThumper.zip",
      "contentType": "application/zip",
      "contentExt": ".xml|.csv"
    },
    "gsl": {
      "fileName": "project.gsl",
      "contentType": "text/plain",
      "contentExt": ".gsl"
    },
    "json": {
      "fileName": "gslOut.json",
      "contentType": "application/json",
      "contentExt": ".json"
    },
    "flat": {
      "fileName": "gslOutFlat.txt",
      "contentType": "text/plain",
      "contentExt": ".txt"
    }
  }
};

/* Note: It is mandatory to specify the GSL_DIR and GSL_EXE path as the path of 
 the binary file could change based on the project settings. */
var gslDir = void 0,
    gslBinary = void 0;
if (process.env.GSL_DIR) gslDir = process.env.GSL_DIR;
if (process.env.GSL_EXE) gslBinary = process.env.GSL_EXE;

var envVariables = 'GSL_LIB=' + gslDir + '/data/lib';
var router = _express2.default.Router();
var jsonParser = _bodyParser2.default.json({
  strict: false
});

/* PROJECT FILE PATH RELATED FUNCTIONS */
var projectPath = 'projects';
var projectDataPath = 'data';
var projectFilesPath = 'files';

var makePath = function makePath() {
  for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
    paths[_key] = arguments[_key];
  }

  if (process.env.STORAGE) {
    return _path2.default.resolve.apply(_path2.default, [process.env.STORAGE].concat(paths));
  }
  return _path2.default.resolve.apply(_path2.default, [__dirname, '../../../storage/'].concat(paths));
};

var createStorageUrl = function createStorageUrl() {
  for (var _len2 = arguments.length, urls = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    urls[_key2] = arguments[_key2];
  }

  var dev = process.env.NODE_ENV === 'test' ? 'test/' : '';
  return makePath.apply(undefined, [dev].concat(urls));
};

var createProjectPath = function createProjectPath(projectId) {
  for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    rest[_key3 - 1] = arguments[_key3];
  }

  (0, _invariant2.default)(projectId, 'Project ID required');
  return createStorageUrl.apply(undefined, [projectPath, projectId].concat(rest));
};

var createProjectDataPath = function createProjectDataPath(projectId) {
  for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    rest[_key4 - 1] = arguments[_key4];
  }

  return createProjectPath.apply(undefined, [projectId, projectDataPath].concat(rest));
};

var createProjectFilesDirectoryPath = function createProjectFilesDirectoryPath(projectId) {
  for (var _len5 = arguments.length, rest = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    rest[_key5 - 1] = arguments[_key5];
  }

  return createProjectDataPath.apply(undefined, [projectId, projectFilesPath].concat(rest));
};

var createProjectFilePath = function createProjectFilePath(projectId, extension, fileName) {
  (0, _invariant2.default)(extension, 'must pass a directory name (extension key)');
  return createProjectFilesDirectoryPath(projectId, extension, fileName);
};

/* HELPER FUNCTIONS */

/* Preprocess arguments to find the arguments that create files */
var preprocessArgs = function preprocessArgs(projectId, extensionKey, args) {
  var modifiedArgs = args;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)((0, _keys2.default)(modifiedArgs)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      if (argConfig.fileArguments.hasOwnProperty(key)) {
        // Get or create a type for this file and modify the argument string.
        var argCounter = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = (0, _getIterator3.default)(argConfig.fileArguments[key].arguments), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var argType = _step2.value;

            if (argType === '<filePath>') {
              modifiedArgs[key][argCounter] = createProjectFilePath(projectId, extensionKey, argConfig.fileArguments[key].fileName);
            } else if (argType === '<prefix>') {
              modifiedArgs[key][argCounter] = argConfig.fileArguments[key].fileName;
            } else if (argType === '<outDir>') {
              modifiedArgs[key][argCounter] = createProjectFilesDirectoryPath(projectId, extensionKey);
              console.log('THE DIRECTORY MADE IS ', modifiedArgs[key][argCounter]);
            }
            argCounter++;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return modifiedArgs;
};

/* Make argument string */
var makeArgumentString = function makeArgumentString(args) {
  var argumentString = '';
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)((0, _keys2.default)(args)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      // create the option string.
      argumentString += " " + key + " ";
      argumentString += args[key].join(" ");
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return argumentString;
};

/* Get the JSON out file path */
var getJsonOutFile = function getJsonOutFile(args) {
  var json = '--json';
  if (args.hasOwnProperty(json)) {
    return args[json][0];
  }
};

/* Read a file, optionally parse Json */
var fileRead = function fileRead(path) {
  var jsonParse = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  return new _promise2.default(function (resolve, reject) {
    _fs2.default.readFile(path, 'utf8', function (err, result) {
      if (err) {
        if (err.code === 'ENOENT') {
          return reject(err);
        }
        return reject(err);
      }
      var parsed = !!jsonParse ? parser(result) : result;
      resolve(parsed);
    });
  });
};

/* Return the contents of the directory */
var directoryContents = function directoryContents(path) {
  var ext = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  return new _promise2.default(function (resolve, reject) {
    _fs2.default.readdir(path, function (err, contents) {
      if (err) {
        return reject(err);
      }
      function checkApe(fileName) {
        if (ext === '') return true;
        return fileName.endsWith(ext);
      }
      resolve(contents.filter(checkApe));
    });
  });
};

/* Make a zip package */
var makeZip = function makeZip(path, fileType) {
  var zip = new JSZip();
  directoryContents(path, argConfig.downloadableFileTypes[fileType].contentExt).then(function (contents) {
    var promise = _promise2.default.resolve('');
    // read and add all the files into the zip file.
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = (0, _getIterator3.default)(contents), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var fileName = _step4.value;

        var fileContents = fileRead(path + '/' + fileName, false);
        zip.file(fileName, fileContents);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(_fs2.default.createWriteStream(path + '/' + argConfig.downloadableFileTypes[fileType].fileName)).on('finish', function () {
      console.log('Written out the .zip file');
    });
  });
};

/* ROUTES */
/* Router for running GSL programs on the server */
router.post('/gslc', jsonParser, function (req, res, next) {
  var input = req.body;
  var content = "#refgenome S288C \n" + input.code; // TODO: Make configurable

  var argumentString = input.arguments;
  // make sure that the server is configured with GSL before sending out
  if (!gslDir || !gslBinary || !_fs2.default.existsSync(gslDir) || !_fs2.default.existsSync(gslBinary)) {
    console.log("ERROR: Someone requested to run GSL code, " + "but this has not been configured. Please set valid 'GSL_DIR' and 'GSL_EXE' environment variables.");
    var result = {
      'result': "Failed to execute GSL code. The server has not been configured for GSL.",
      'contents': [],
      'status': -1
    };
    res.status(501).json(result); // Service not implemented
  } else {
    (function () {
      var modifiedArgs = preprocessArgs(input.projectId, input.extension, input.args);
      var jsonOutFile = getJsonOutFile(modifiedArgs);
      argumentString = makeArgumentString(modifiedArgs);
      var projectFileDir = createProjectFilesDirectoryPath(input.projectId, input.extension);
      var filePath = createProjectFilePath(input.projectId, input.extension, argConfig.gslFile.fileName);
      if (!_fs2.default.existsSync(projectFileDir)) {
        _fs2.default.mkdirSync(projectFileDir);
      }

      var output = '';
      // write out a file with the code.
      _fs2.default.writeFile(filePath, content, function (err) {
        if (err) {
          console.log(err);
        }
        // execute the code
        var command = envVariables + ' mono ' + gslBinary + ' ' + argumentString + ' ' + filePath;
        console.log('Running: ', command);
        var process = (0, _child_process.exec)('' + command, function (err, stdout, stderr) {
          if (err) {
            console.log('The GSL command encountered an error:');
            console.log(err);
          }
        });

        process.stdout.on('data', function (data) {
          output += data;
        });

        process.stderr.on('data', function (data) {
          output += data;
        });

        // find the exit code of the process.     
        process.on('exit', function (code) {

          // mask all server paths
          output = output.replace(new RegExp(projectFileDir, 'g'), '<Server_Path>');
          console.log('Child process exited with an exit code of ', code);
          if (code == 0) {
            _fs2.default.readFile(jsonOutFile, 'utf8', function (err, contents) {
              if (err) {
                res.status(500).send('Error reading the json file.');
                return;
              }
              var result = {
                'result': output,
                'contents': contents,
                'status': code
              };
              res.status(200).json(result);
            });
            makeZip(projectFileDir, 'ape');
          } else {
            var _result = {
              'result': output,
              'contents': [],
              'status': code
            };
            res.status(422).json(_result);
          }
        });
      });
    })();
  }
});

/* Download any data file */
router.get('/download*', function (req, res, next) {

  if (argConfig.downloadableFileTypes.hasOwnProperty(req.query.type)) {
    console.log("Got a request to download the type: ", argConfig.downloadableFileTypes[req.query.type]);
    var fileName = argConfig.downloadableFileTypes[req.query.type].fileName;
    var filePath = createProjectFilePath(req.query.projectId, req.query.extension, fileName);
    res.header("Content-Type", argConfig.downloadableFileTypes[req.query.type].contentType);
    res.download(filePath, fileName);
  } else {
    res.send('Could not find an appropriate file type to download.');
    res.send(501);
  }
});

module.exports = router;
