/**
 * Defines behavior for the editor autocompletion.
 */
//const s288c = require('gsl-genome-s288c');

// const genomes = [
//   s288c,
// ];
const genomes = [];

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

// Add a combination for each of the genes as well.
const operators = ['p', 'g', 'o', 't', 'd', 'u', 'f', 'm'];
const operatorMapDocs = {
  'p': 'Promoter part of ',
  'g': 'Gene locus of ',
  'o': 'Open reading frame of ',
  't': 'Terminator part of ',
  'd': 'Downstream part of ',
  'u': 'Upstream part of ',
  'f': 'Fusible ORF of ',
  'm': 'mRNA of ',
};

for (const genome of genomes) {
  let element;
  for (element of genome) {
    let operator;
    for (operator of operators) {
      if (element.commonName.trim() !== '') {
        autocompleteGeneList.push(operator + element.commonName);
        autocompleteDocStrings[operator + element.commonName] = operatorMapDocs[operator] + element.commonName;
      }
      if (element.systematicName.trim() !== '') {
        autocompleteGeneList.push(operator + element.systematicName);
        autocompleteDocStrings[operator + element.systematicName] = operatorMapDocs[operator] + element.systematicName;
      }
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
