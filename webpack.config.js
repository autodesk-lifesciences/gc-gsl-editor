module.exports = {
  extry: './main.js',
  output: {
    filename: 'index.js',
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
        require('postcss-import')({addDependencyTo: bundler}),
        require('postcss-nested')(),
        require('postcss-cssnext')({autoprefixer: AUTOPREFIXER_BROWSERS})
      ];
    },
    devtool: 'inline-source-map',
  },
};
