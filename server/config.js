// support different GSL servers if necessary
const GSL_SERVER = process.env.GSL_SERVER || 'https://gsl.dev.lifesciences.autodesk.com';
console.log('target GSL server:', GSL_SERVER);

export const argConfig = {
  'externalServer': {
    'url': GSL_SERVER,
  },
  'fileArguments': {
    '--flat': {
      'arguments': ['<filePath>'],
      'fileName': 'gslOutFlat.txt',
    },
    '--json': {
      'arguments': [ '<filePath>' ],
      'fileName': 'gslOut.json',
    },
    '--ape': {
      'arguments': [ '<outDir>', '<prefix>' ],
      'fileName': 'gslOut',
    },
    '--cm': {
      'arguments': [ '<outDir>', '<prefix>'],
      'fileName': 'gslOut',
    },
    '--primers': {
      'arguments': ['<filePath>'],
      'fileName': 'gslOut.primers.txt',
    },
    '--docstring': {
      'arguments': ['<filePath>'],
      'fileName': 'gslOut.doc',
    },
    '--name2id': {
      'arguments': ['<filePath>'],
      'fileName': 'gslOut.name2id.txt',
    },
    '--thumper': {
      'arguments': ['<filePath>'],
      'fileName': 'thumperOut',
    },
  },
  'gslFile': {
    'fileName': 'project.run.gsl',
    'preCode': '',
  },
  'downloadableFileTypes': {
    'ape': {
      'fileName': 'gslOutApe.zip',
      'contentType': 'application/zip',
      'contentExt': '.ape$',
      'isRemote': 1,
    },
    'cm': {
      'fileName': 'gslOutCm.zip',
      'contentType': 'application/zip',
      'contentExt': '.cx5$',
      'isRemote': 1,
    },
    'thumper': {
      'fileName': 'gslOutThumper.zip',
      'contentType': 'application/zip',
      'contentExt': '^thumperOut',
    },
    'gsl': {
      'fileName': 'project.gsl',
      'contentType': 'text/plain',
      'contentExt': '.gsl',
    },
    'json': {
      'fileName': 'gslOut.json',
      'contentType': 'application/json',
      'contentExt': '.json',
    },
    'flat': {
      'fileName': 'gslOutFlat.txt',
      'contentType': 'text/plain',
      'contentExt': '.txt',
    },
    'rabitXls': {
      'fileName': 'thumperOut.rabits.xls',
      'contentType': 'application/vnd.ms-excel',
      'contentExt': '.xls',
    },
    'allFormats': {
      'fileName': 'gslProjectFiles.zip',
      'contentType': 'application/zip',
      'contentExt': 'project.gsl|thumperOut|gslOut.json|.xls|.txt|.ape|.cx5',
      'isRemote': 1,
    },
  },
};
