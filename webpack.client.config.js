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

const clientModules = {
  loaders: [
    {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: [
        /node_modules/,
        'client-build.js',
        'server-build.js',
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
      require('postcss-import')({ addDependencyTo: bundler }),
      require('postcss-nested')(),
      require('postcss-cssnext')({ autoprefixer: AUTOPREFIXER_BROWSERS }),
    ];
  },
  //devtool: 'inline-source-map',
};

// entry point doesn't vary by build
const entry = './main.js';

// =================================================================================
// debug builds a source map decorated, non minified version of the extension client
// =================================================================================
const debug = {
  entry,
  output: {
    filename: './client-build.js',
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
    filename: './client-build.js',
  },
  module: clientModules,
};

// =======================================================================================
// dev builds a source map decorated, non minified version of the extension client (watch)
// =======================================================================================
const dev = {
  entry,
  output: {
    filename: './client-build.js',
  },
  module: clientModules,
};

// get target from npm command used to start the build
const TARGET = process.env.npm_lifecycle_event;

// now build the required target ( for debug and/or watch mode )
if (TARGET === 'debug-client') {
  module.exports = debug;
}

if (TARGET === 'release-client') {
  module.exports = release;
}

if (TARGET === 'watch-client') {
  module.exports = dev;
}
