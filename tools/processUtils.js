/*
 Copyright 2016 Autodesk,Inc.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { exec, spawn } from 'child_process';

const DEBUG = process.argv.includes('--DEBUG');

/** command utils **/

//simple wrap around console.log
const log = (output = '', forceOutput = false) => {
  if (DEBUG || forceOutput === true) {
    console.log(output.trim());
  }
};

export const promisedExec = (cmd, opts, {
  forceOutput = false,
} = {}) => {
  console.log('running ' + cmd);

  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      //`` to convert from buffers
      if (stdout) {
        log(`${stdout}`, forceOutput);
      }
      if (stderr) {
        log(`${stderr}`, forceOutput);
      }

      return resolve(`${stdout}`, `${stderr}`);
    });
  });
};

export const spawnWaitUntilString = (cmd, args, opts, {
  waitUntil = `${Math.random()}`,
  forceOutput = false,
  failOnStderr = false,
} = {}) => {
  console.log('\nrunning: ' + cmd + ' ' + args.join(' '));

  return new Promise((resolve, reject) => {
    //const [ command, ...args ] = cmd.split(' ');
    const process = spawn(cmd, args, opts);

    process.stdout.on('data', data => {
      log(`${data}`, forceOutput);
      if (`${data}`.indexOf(waitUntil) >= 0) {
        resolve(process);
      }
    });

    process.stderr.on('data', data => {
      log(`${data}`, true);
      if (`${data}`.indexOf(waitUntil) >= 0) {
        return resolve(process);
      }
      if (failOnStderr === true) {
        console.log('REJECTING');
        process.kill();
        reject(process);
      }
    });

    process.on('error', (err) => {
      console.log('Error in process');
      console.log(err);
    });

    process.on('close', (code) => {
      log(`child process exited with code ${code}`, forceOutput);
    });
  });
};
