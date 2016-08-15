var path = require('path');

module.exports = {
  entry: './server/router.js',

  output: {
    path: path.join(__dirname),
    filename: 'serve-build.js',
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
};

