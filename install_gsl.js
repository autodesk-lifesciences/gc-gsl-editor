import { exec } from 'child_process';

const repoName = 'GSL';

console.log('\n\n\nstarting download + install of GSL');

exec('rm -rf ' + repoName + ' && git clone https://github.com/rupalkhilari/GSL.git && cd '+repoName+' && git checkout json_assembly && ./build.sh', {
  cwd: __dirname,
}, function (err, stdout, stderr) {
  console.log(err);
  console.log(stdout);
  console.log(stderr);
});
