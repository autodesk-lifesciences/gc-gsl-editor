var path = require('path');

var AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1',
];

module.exports = {
  entry: './main.js',

  output: {
    path: path.join(__dirname),
    filename: 'client-build.js',
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [
          /node_modules/,
          'index.js',
        ],
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      }
    ],
    postcss: function plugins(bundler) {
      return [
        require('postcss-import')({ addDependencyTo: bundler }),
        require('postcss-nested')(),
        require('postcss-cssnext')({ autoprefixer: AUTOPREFIXER_BROWSERS })
      ];
    },
    devtool: 'inline-source-map',
  },
};
