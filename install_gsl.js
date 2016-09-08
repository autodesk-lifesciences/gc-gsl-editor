import { exec } from 'child_process';
import path from 'path';
const repoName = 'GSL';

console.log('\n\n\nstarting download + install of GSL');

const wrappedExec = (command, directory = __dirname) => {
  return new Promise((resolve, reject) => {
    exec(command, {
      cwd: directory,
    }, (err, stdout, stderr) => {
      console.log(err);
      console.log(stdout);
      console.log(stderr);
      resolve();
    });
  });
};

async function installGsl() {
  await wrappedExec(`rm -rf ${repoName}`);
  await wrappedExec('git clone https://github.com/rupalkhilari/GSL.git');
  await wrappedExec('git checkout json_assembly', path.resolve(__dirname, repoName));
  await wrappedExec('./build.sh', path.resolve(__dirname, repoName));
}
