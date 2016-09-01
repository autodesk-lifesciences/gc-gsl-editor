'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _commandExists = require('command-exists');

var _commandExists2 = _interopRequireDefault(_commandExists);

var _project = require('./server/utils/project');

var _command = require('./server/utils/command');

var _fileSystem = require('./server/utils/fileSystem');

var _config = require('./server/config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Paths are relative to the directory containing the babel written output - server-build.js
var repoName = 'GSL'; /**
                       * Contains definitions for the GSL server end points.
                       */

var gslDir = _path2.default.resolve(__dirname, repoName);
var gslBinary = _path2.default.resolve(gslDir, 'bin/gslc/gslc.exe');
var envVariables = 'GSL_LIB=' + gslDir + '/data/lib';

var router = _express2.default.Router();
var jsonParser = _bodyParser2.default.json({
  strict: false
});

/**
 * Route for running GSL programs on the server
 */
router.post('/gslc', jsonParser, function (req, res, next) {
  var input = req.body;
  var content = '';
  if (_config.argConfig.gslFile.hasOwnProperty('preCode')) {
    content += _config.argConfig.gslFile.preCode;
  }

  content += input.code;

  var argumentString = null;
  if (input.hasOwnProperty('arguments')) argumentString = input.arguments;

  // make sure that mono is installed on the server.
  (0, _commandExists2.default)('mono', function (err, commandExists) {
    if (err || !commandExists) {
      console.log('ERROR: Could not find mono/fsharp installation on the server to run GSL.');
      var result = {
        'result': 'ERROR: Could not find a valid mono installation on the server to run GSL.',
        'contents': [],
        'status': -1
      };
      res.status(501).json(result); // Service not implemented
    }
    // make sure that the server is configured with GSL before sending out
    if (!gslDir || !gslBinary || !_fs2.default.existsSync(gslDir) || !_fs2.default.existsSync(gslBinary)) {
      console.log('ERROR: Someone requested to run GSL code, but this has not been configured.');
      console.log('gslDir: ' + gslDir + ' and gslBinary: ' + gslBinary);
      console.log(gslDir, gslBinary, _fs2.default.existsSync(gslDir), _fs2.default.existsSync(gslBinary));
      var _result = {
        'result': 'ERROR: Failed to execute GSL code. The server has not been configured for GSL.',
        'contents': [],
        'status': -1
      };
      res.status(501).json(_result); // Service not implemented
    } else {
      (function () {
        var modifiedArgs = (0, _command.preprocessArgs)(input.projectId, input.extension, input.args);
        var jsonOutFile = (0, _command.getJsonOutFile)(modifiedArgs);
        if (!argumentString) argumentString = (0, _command.makeArgumentString)(modifiedArgs);
        var projectFileDir = (0, _project.createProjectFilesDirectoryPath)(input.projectId, input.extension);
        var filePath = (0, _project.createProjectFilePath)(input.projectId, input.extension, _config.argConfig.gslFile.fileName);
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

          var process = void 0;
          try {
            process = (0, _child_process.exec)('' + command, function (err, stdout, stderr) {
              if (err) {
                console.log('Invalid GSL code.');
                console.log(err);
              }
            });
          } catch (ex) {
            console.log('The following exception occured while running the gslc command ', ex);
            var _result2 = {
              'result': 'An exception occured while running the gslc command.',
              'contents': [],
              'status': -1
            };
            res.status(500).json(_result2);
          }

          if (process) {
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

                // Create zip packages.
                if (modifiedArgs.hasOwnProperty('--cm')) (0, _fileSystem.makeZip)(projectFileDir, _config.argConfig.downloadableFileTypes['cm'].contentExt, _config.argConfig.downloadableFileTypes['cm'].fileName);

                if (modifiedArgs.hasOwnProperty('--ape')) (0, _fileSystem.makeZip)(projectFileDir, _config.argConfig.downloadableFileTypes['ape'].contentExt, _config.argConfig.downloadableFileTypes['ape'].fileName);

                (0, _fileSystem.makeZip)(projectFileDir, _config.argConfig.downloadableFileTypes['allFormats'].contentExt, _config.argConfig.downloadableFileTypes['allFormats'].fileName);

                if (modifiedArgs.hasOwnProperty('--thumper')) {
                  (0, _fileSystem.makeZip)(projectFileDir, _config.argConfig.downloadableFileTypes['thumper'].contentExt, _config.argConfig.downloadableFileTypes['thumper'].fileName).then(function () {
                    // create the rabit spreadsheet.
                    var inputFile = projectFileDir + '/' + _config.argConfig.fileArguments["--thumper"].fileName + '.rabits.txt';
                    var outputFile = projectFileDir + '/' + _config.argConfig.fileArguments["--thumper"].fileName + '.rabits.xls';
                    console.log('Copying ' + inputFile + ' to ' + outputFile);
                    try {
                      _fs2.default.createReadStream(inputFile).pipe(_fs2.default.createWriteStream(outputFile));
                    } catch (ex) {
                      console.log('Failed to read ' + inputFile + ' and write to ' + outputFile + '.', ex);
                    }
                  }).catch(function (ex) {
                    console.log('An error occured while writing the .xls file', ex);
                  });
                }
              } else {
                var _result3 = {
                  'result': output,
                  'contents': [],
                  'status': code
                };
                res.status(422).json(_result3);
              }
            });
          }
        });
      })();
    }
  });
});

/**
 * Route for downloading any file type. 
 * (Should be specified in 'downloadableFileTypes' in config.js)
 */
router.get('/download*', function (req, res, next) {

  if (_config.argConfig.downloadableFileTypes.hasOwnProperty(req.query.type)) {
    (function () {
      var fileName = _config.argConfig.downloadableFileTypes[req.query.type].fileName;
      var filePath = (0, _project.createProjectFilePath)(req.query.projectId, req.query.extension, fileName);
      _fs2.default.exists(filePath, function (exists) {
        if (exists) {
          res.header('Content-Type', _config.argConfig.downloadableFileTypes[req.query.type].contentType);
          res.download(filePath, fileName);
        } else {
          res.send('No file of type ' + req.query.type + ' generated yet');
          res.status(404);
        }
      });
    })();
  } else {
    res.send('Could not find an appropriate file type to download.');
    res.status(501);
  }
});

/**
 * Route to list the available file downloads.
 */
router.post('/listDownloads', function (req, res, next) {
  // list the available downloads.
  var input = req.body;
  var fileStatus = {};
  var projectFileDir = (0, _project.createProjectFilesDirectoryPath)(input.projectId, input.extension);
  (0, _keys2.default)(_config.argConfig.downloadableFileTypes).forEach(function (key) {
    var filePath = projectFileDir + '/' + _config.argConfig.downloadableFileTypes[key].fileName;
    try {
      _fs2.default.accessSync(filePath);
      fileStatus[key] = true;
    } catch (e) {
      fileStatus[key] = false;
    }
  });
  res.status(200).json(fileStatus);
});

module.exports = router;
