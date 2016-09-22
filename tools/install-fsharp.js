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
import commandExists from 'command-exists';

async function installFSharp() {
  try {
    if (process.platform === 'linux') {
      await promisedExec('sudo add-apt-repository ppa:ubuntu-toolchain-r/test -y', {}, { forceOutput: true});
      await promisedExec('sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF', {}, { forceOutput: true});
      await promisedExec('echo "deb http://download.mono-project.com/repo/debian wheezy main" | sudo tee /etc/apt/sources.list.d/mono-xamarin.list', {}, { forceOutput: true});
      await promisedExec('echo "deb http://download.mono-project.com/repo/debian wheezy-libtiff-compat main" | sudo tee -a /etc/apt/sources.list.d/mono-xamarin.list', {}, { forceOutput: true});
      await promisedExec('sudo apt-get update -y', {}, { forceOutput: true});
      await promisedExec('sudo apt-get install mono-devel -yf', {}, { forceOutput: true});
      await promisedExec('sudo apt-get install ca-certificates-mono -yf', {}, { forceOutput: true});
      await promisedExec('sudo apt-get install mono-complete -yf', {}, { forceOutput: true});
      await promisedExec('sudo apt-get install fsharp -yf', {}, { forceOutput: true});
    } else if (process.platform === 'darwin') {
      commandExists('brew', (err, commandExists) => {
        if (err || !commandExists) {
            const brewErrorMessage = 
              "****************************************************\n" +
              "              Action Required! \n" +
              "\n" +
              "We could not detect 'Homebrew' installed on your \n" +
              "system. Please refer to http://fsharp.org/use/mac/ \n" +
              "and follow the instructions given to manually \n" +
              "install mono.\n" +
              "\n" +
              "****************************************************";
            console.log(brewErrorMessage);
        } else {
          promisedExec('brew install mono', {}, { forceOutput: true});
        }
      });
    } else if (process.platform.startswith('win')) {
      commandExists('mono', (err, commandExists) => {
        if (err || !commandExists) {
          const monoErrorMessage = 
            "****************************************************\n" +
            "              Action Required! \n" +
            "\n" +
            "We could not detect mono installed on your \n" +
            "system. Please refer to http://fsharp.org/use/windows/ \n" +
            "and follow the instructions given to manually \n" +
            "install mono. Make you have added 'mono' to the 'PATH'\n" +
            "varible.\n"+
            "\n" +
            "****************************************************";
          console.log(monoErrorMessage);
        }
      });     
    }
  } catch (err) {
    console.log('CAUGHT', err);
    throw err;
  }
}

export default installFSharp;