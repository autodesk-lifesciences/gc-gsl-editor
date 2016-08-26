var fs = require('fs');
var path = require('path');
var readline = require('readline');
var exec = require('child_process').exec;

// Run from the root of the project.
// To make it executable chmod a+x ./bin/e2e.js     

fs.readdir('./tests/e2e/tests/', (err, files) => {
  if (err) {
    console.log('Error reading tests folder');
  } else {
    console.log('----- Available tests -----\n')
    files.forEach((file, index) => {
      console.log(`${index}: ${file}`);
    });
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nEnter the test number to run ', (answer) => {
      rl.close();
      const number = parseFloat(answer);
      if (number >= 0 && number < files.length) {
        exec(`node ./node_modules/nightwatch/bin/nightwatch --config ./tests/e2e/nightwatch.json --test ./tests/e2e/tests/${files[number]}`, (error, stdout, stderr) => {
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
          if (error !== null) {
            console.log(`exec error: ${error}`);
          }
        });
      }
    });
  }
});
