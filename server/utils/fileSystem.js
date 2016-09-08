/**
 * File-System related helper functions.
 */

const JSZip = require('jszip');
import fs from 'fs';

/**
 * JSON parser.
 * @param {string} content
 */
const parser = (string) => {
  if (typeof string !== 'string') {
    return string;
  }
  try {
    return JSON.parse(string);
  } catch (err) {
    console.error(err);
    return {};
  }
};

/**
 * Read a file, optionally parse Json.
 * @param {string} path
 * @param {bool} True, if json should be parsed.
 * @return {string|Object} - Content of the file as a string or JSON Object
 */
export const fileRead = (path, jsonParse = true) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, result) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return reject(err);
        }
        return reject(err);
      }
      const parsed = !!jsonParse ? parser(result) : result;
      resolve(parsed);
    });
  });
};

/**
 * Return the contents of the directory based on a pattern match.
 * @param {string} path
 * @param {string} regex pattern
 * @return {array} items - List of files matching the given regex.
 */
export const directoryContents = (path, pattern = '') => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, contents) => {
      if (err) {
        return reject(err);
      }
      const reg = new RegExp(pattern);
      resolve(contents.filter((item) => {
        return reg.test(item);
      }));
    });
  });
};

/**
 * Create a zip archive of files.
 * @param {string} directory path
 * @param {string} content extension regex
 * @param {string} zipFileName
 * @return {Object} JSZip object (zip archive)
 */
export const makeZip = (path, contentExt, zipFileName) => {
  return new Promise((resolve, reject) => {
    const zip = new JSZip();
    directoryContents(path, contentExt)
    .then(directoryContents => Promise.all(
      directoryContents.map(fileName => {
        return fileRead(path + '/' + fileName, false).then(fileContents => {
          zip.file(fileName, fileContents);
        });
      })
    ))
    .then(() => {
      zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
      .pipe(fs.createWriteStream(path + '/' + zipFileName))
      .on('finish', () => {
        console.log(`Written out ${zipFileName}.`);
        resolve(zip);
      });
    })
    .catch((err) => {
      console.log(`Error making zip file ${zipFileName}`);
      console.log(err);
      reject(err);
    });
  });
};
