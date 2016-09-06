var path = require('path');
var webpack = require('webpack');
var extensionConfig = require('./package.json');
// modules section is very similar for debug and release so
// the config is shared. In release we add eslint as a preLoader.

const serverModules = {
  loaders: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
    },
    {
      test: /\.json/,
      loader: 'json-loader'
    }
  ],
};
// entry point doesn't vary by build
const entry = "./server/router.js";

// ===========================================================================
// debug builds a source map decorated, non minified version of the extension
// ===========================================================================
const debug = {
  entry,
  target: "node",
  node: {
    '__dirname': true
  },
  output: {
    filename: "./server-build.js",
    libraryTarget: 'commonjs2',
  },
  devtool: "inline-source-map",
  module: serverModules,
  plugins: [
    new webpack.DefinePlugin({
      'EXTENSION_DEPLOY_DIR': JSON.stringify(path.join('extensions', 'node_modules', extensionConfig.name))
    })
  ],
};

const server = {
  entry,
  target: "node",
  node: {
    '__dirname': true
  },
  output: {
    filename: "./server-build.js",
    libraryTarget: 'commonjs2',
  },
  module: serverModules,
  devtool: "inline-source-map",
  plugins: [
    new webpack.DefinePlugin({
      'EXTENSION_DEPLOY_DIR': JSON.stringify(path.join('extensions', 'node_modules', extensionConfig.name))
    })
  ],
};

// ===========================================================================
// release builds a minified version of the extension
// ===========================================================================
const releaseback = {
  entry,
  target: "node",
  node: {
    '__dirname': true
  },
  output: {
    filename: "./server-build.js",
    libraryTarget: 'commonjs2',
  },
  module: Object.assign({}, serverModules, {
    preLoaders: [
      {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
    ],
  }),
  plugins: [
    new webpack.DefinePlugin({
      'EXTENSION_DEPLOY_DIR': JSON.stringify(path.join('extensions', 'node_modules', extensionConfig.name))
    })
  ],
  eslint: {
    configFile: './.eslintrc',
    failOnError: true
  }
};

const release = {
  entry,
  target: "node",
  node: {
    '__dirname': true
  },
  output: {
    filename: "./server-build.js",
    libraryTarget: 'commonjs2',
  },
  module: serverModules,
  plugins: [
    new webpack.DefinePlugin({
      'EXTENSION_DEPLOY_DIR': JSON.stringify(path.join('extensions', 'node_modules', extensionConfig.name))
    })
  ]
};
// ===========================================================================
// dev is a modified version of the debug build that puts the output directly in the app.
// Change the filename to put to your dev file.
// ===========================================================================
const dev = {
  entry,
  target: "node",
  node: {
    '__dirname': true
  },
  output: {
    filename: "./server-build.js",
    libraryTarget: 'commonjs2',
  },
  module: serverModules,
  devtool: "inline-source-map",
  plugins: [
    new webpack.DefinePlugin({
      'EXTENSION_DEPLOY_DIR': JSON.stringify(path.join('extensions', 'node_modules', extensionConfig.name))
    })
  ],
};

// get target from npm command used to start the build
const TARGET = process.env.npm_lifecycle_event;

// now build the required target ( for debug and/or watch mode )
if (TARGET === 'debug-server') {
  module.exports = debug;
}

if (TARGET === 'release-server') {
  module.exports = release;
}

if (TARGET === 'watch-server') {
  module.exports = dev;
}

if (TARGET === 'build-server') {
  module.exports = server;
}
