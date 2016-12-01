export const argConfig = {
  'externalServer': {
    'url': 'https://gsl.dev.bionano.autodesk.com',
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
