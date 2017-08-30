const path = require('path');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssCssnext = require('postcss-cssnext');

const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1',
];

const distPath = 'dist/index.js';

const clientModules = {
  loaders: [
    {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: [
        /node_modules/,
        distPath,
      ],
    },
    {
      test: /\.css$/,
      loader: 'style-loader!css-loader!postcss-loader',
    },
    {
      test: /\.json/,
      loader: 'json-loader',
    },
  ],
  postcss: function plugins(bundler) {
    return [
      postcssImport({ addDependencyTo: bundler }),
      postcssNested(),
      postcssCssnext({ autoprefixer: AUTOPREFIXER_BROWSERS }),
    ];
  },
  //devtool: 'inline-source-map',
};

// entry point doesn't vary by build
const entry = './src/main.js';

// ===========================================================================
// debug builds a source map decorated, non minified version of the extension client.
// If GC_DIR is set, the output is put directly in the app.
// ===========================================================================
if (!process.env.GC_DIR) {
  console.warn(`GC_DIR env var not set, assuming you are running GC via
    docker-compose up, and mounting the sequence-viewer code via a documented
    change in the docker-compose.override.yml file. Otherwise set GC_DIR to the
    absolute path of the Genetic Constructor project`);
}

const debug = {
  entry,
  output: {
    // for local development you can build the extension directly into its
    // linked folder in the application
    filename: process.env.GC_DIR ? path.join(process.env.GC_DIR, `server/extensions/node_modules/GC-GSL-Editor/${distPath}`) : distPath,
  },
  module: clientModules,
  devtool: 'inline-source',
};


// ===========================================================================
// release builds a minified version of the extension client
// ===========================================================================
const release = {
  entry,
  output: {
    filename: distPath,
  },
  module: clientModules,
};

// =======================================================================================
// dev builds a source map decorated, non minified version of the extension client (watch)
// =======================================================================================
const dev = {
  entry,
  output: {
    filename: process.env.GC_DIR ? path.join(process.env.GC_DIR, `server/extensions/node_modules/GC-GSL-Editor/${distPath}`) : distPath,
  },
  module: clientModules,
  devtool: 'inline-source-map',
};

// get target from npm command used to start the build
const TARGET = process.env.npm_lifecycle_event;

// now build the required target ( for debug and/or watch mode )
if (TARGET === 'debug') {
  module.exports = debug;
}

if (TARGET === 'release') {
  module.exports = release;
}

if (TARGET === 'watch') {
  module.exports = dev;
}
