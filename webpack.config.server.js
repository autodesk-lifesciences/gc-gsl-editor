var path = require('path');
var fs = require('fs');

//get list of node modules for webpack to avoid bundling on server
var nodeModules = fs.readdirSync('./node_modules')
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .reduce(
    (acc, mod) => Object.assign(acc, { [mod]: true }),
    {}
  );

module.exports = {
  entry: './server/router.js',

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },

  target: 'node',

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [
          /node_modules/,
        ],
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ],
  },

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },

  //todo - only for server
  externals: nodeModules,
};

