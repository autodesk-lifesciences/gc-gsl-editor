/**
 * Helper functions to execute a GSL command line tool (gslc) and process its argumnets.
 */

import { createProjectFilePath, createProjectFilesDirectoryPath } from './project';
import { argConfig } from '../config';

/**
 * Preprocess arguments to replace placeholders with filepaths.
 * @param {string} projectID
 * @param {string} extensionKey
 * @param {Object} args - Hash of gslc options with file placeholders
 * @return {Object} - Hash of gslc options with resolved file path arguments
 */
export const preprocessArgs = (projectId, extensionKey, args) => {
  const modifiedArgs = args;
  for (const key of Object.keys(modifiedArgs)) {
    if (argConfig.fileArguments.hasOwnProperty(key)) {
      // Get or create a type for this file and modify the argument string.
      let argCounter = 0;
      for (const argType of argConfig.fileArguments[key].arguments) {
        if (argType === '<filePath>') {
          modifiedArgs[key][argCounter] = createProjectFilePath(projectId, extensionKey, argConfig.fileArguments[key].fileName);
        } else if (argType === '<prefix>') {
          modifiedArgs[key][argCounter] = argConfig.fileArguments[key].fileName;
        } else if (argType === '<outDir>') {
          modifiedArgs[key][argCounter] = createProjectFilesDirectoryPath(projectId, extensionKey);
        }
        argCounter++;
      }
    }
  }
  return modifiedArgs;
};

/**
 * Make a string of the GSL argument map.
 * @param {Object} Processed gslc options
 * @return {string} - A string of options and arguments.
 */
export const makeArgumentString = (args) => {
  let argumentString = '';
  for (const key of Object.keys(args)) {
    // create the option string.
    argumentString += ' ' + key + ' ';
    argumentString += args[key].join(' ');
  }
  return argumentString;
};

/**
 * Gets the JSON Out file path
 * @param {Object} Processed gslc options
 * @return {string} - Path of the output json file
 */
export const getJsonOutFile = (args) => {
  const json = '--json';
  if (args.hasOwnProperty(json)) {
    return args[json][0];
  }
};
