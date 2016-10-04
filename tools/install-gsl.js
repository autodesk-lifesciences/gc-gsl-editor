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

import { promisedExec } from './processUtils';
import fs from 'fs';
import rimraf from 'rimraf';

const repo = 'https://github.com/rupalkhilari/GSL-build.git';
const branch = 'new_genomes_build';

async function installGSL() {
  try {
    if (!fs.existsSync('GSL')) {
      await promisedExec('git clone ' + repo + ' GSL', {}, { forceOutput: true});
      process.chdir('GSL');
      await promisedExec('git checkout ' + branch, {}, { forceOutput: true});
    } else if (fs.existsSync('GSL/.git')) {
      process.chdir('GSL');
      await promisedExec('git pull', {}, { forceOutput: true});
      await promisedExec('git checkout ' + branch, {}, { forceOutput: true});
    } else {
      rimraf.sync('GSL');
      console.log('Removed GSL directory');
      await promisedExec('git clone ' + repo + ' GSL', {}, { forceOutput: true} );
      process.chdir('GSL');
      await promisedExec('git checkout ' + branch, {}, { forceOutput: true});
    }
  } catch (err) {
    console.log('CAUGHT', err);
    throw err;
  }
}

export default installGSL;
