/**
 * Defines behavior for the editor autocompletion.
 */
const s288c = require('gsl-genome-s288c');

const genomes = [
  s288c,
];
const autocompleteGeneList = [];
const autocompleteDocStrings = {};
const geneList = [];
let altName;
let geneListString;

for (const genome of genomes) {
  let element;
  for (element of genome) {
    if (element.systematicName.trim() !== '') {
      autocompleteGeneList.push(element.systematicName);
      altName = '';
      if (element.commonName !== '') {
        altName = '[' + element.commonName + '] ';
      }
      autocompleteDocStrings[element.systematicName] = altName + element.description;
      geneList.push({ value: element.systematicName, meta: 'gene'});
    }
  }
  for (element of genome) {
    if (element.commonName.trim() !== '') {
      autocompleteGeneList.push(element.commonName);
      altName = '';
      if (element.systematicName !== '') {
        altName = '[' + element.systematicName + '] ';
      }
      autocompleteDocStrings[element.commonName] = altName + element.description;
      geneList.push({ value: element.commonName, meta: 'gene'});
    }
  }
}
// sort the lists alphabetically
autocompleteGeneList.sort();
geneList.sort();

geneListString = autocompleteGeneList.join('|');

// create a list of genes to be validated by the highlighter.
exports.geneList = geneList;
exports.geneListString = geneListString;
exports.geneDocStrings = autocompleteDocStrings;
