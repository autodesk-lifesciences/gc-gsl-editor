import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import path from 'path'
import fs from 'fs';
import { exec, spawn } from 'child_process';

// read the environment variable and set the GSL directory.
let gslDir, gslBinary;
if (process.env.GSL_DIR)
  gslDir = process.env.GSL_DIR;
if (process.env.GSL_EXE)
  gslBinary = process.env.GSL_EXE;

const envVariables = `GSL_LIB=${gslDir}/data/lib`;
const outputFile = '/tmp/placeholder.json';

const router = express.Router();
const jsonParser = bodyParser.json({
	strict: false,
}); 

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
  crypto.randomBytes(16, function(err, buffer) {
    const filename = buffer.toString('hex');
    const filePath = '/tmp/' + filename + '.gsl';
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
        //console.log("Output:", output);
        console.log('Child process exited with an exit code of ', code);
        if (code == 0) {
          fs.readFile(outputFile, 'utf8', (err, contents) => {
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
  });
}
});

module.exports = router;