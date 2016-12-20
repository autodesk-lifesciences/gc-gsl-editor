/**
 * Helper functions to determine the project-related data paths.
 * Taken from server/utils/filePaths.js
 */

import invariant from 'invariant';
import path from 'path';

const projectPath = 'projects';
const projectDataPath = 'data';
const projectFilesPath = 'files';

//note these were very poorly migrated when the GSL repo was split into two
//importantly, these should match the standalone GSL server, as they are only used to create routes to hit that server
//this file was taken from Constructor directly when it relied on a file system for storage. but it no longer does.

const makePath = (...paths) => {
  if (process.env.STORAGE) {
    return path.resolve(process.env.STORAGE, ...paths);
  }
  return path.resolve(process.cwd(), 'storage', ...paths);
};

const createStorageUrl = (...urls) => {
  const dev = ((process.env.NODE_ENV === 'test') ? 'test/' : '');
  return makePath(dev, ...urls);
};

const createProjectPath = (projectId, ...rest) => {
  invariant(projectId, 'Project ID required');
  return createStorageUrl(projectPath, projectId, ...rest);
};

const createProjectDataPath = (projectId, ...rest) => {
  return createProjectPath(projectId, projectDataPath, ...rest);
};

export const createProjectFilesDirectoryPath = (projectId, ...rest) => {
  return createProjectDataPath(projectId, projectFilesPath, ...rest);
};

export const createProjectFilePath = (projectId, extension, fileName) => {
  invariant(extension, 'must pass a directory name (extension key)');
  return createProjectFilesDirectoryPath(projectId, extension, fileName);
};
