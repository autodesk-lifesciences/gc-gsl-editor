/**
 * Defines how the GSL assemblies are rendered on the canvas.
 */
import * as compiler from '../compiler/client';
const gslState = require('../../../globals');
const extensionConfig = require('../../../package.json');
const compilerConfig = require('../compiler/config.json');

/**
 * Removes the GSL constructs from the canvas based on the output
 */
const removeGSLConstructs = () => {
  for (const blockId of gslState.gslConstructs) {
    if (window.constructor.api.projects.projectHasComponent(
        window.constructor.api.projects.projectGetCurrentId(),
        blockId)) {
      window.constructor.api.projects.projectRemoveConstruct(
        window.constructor.api.projects.projectGetCurrentId(),
        blockId
      );
    }
  }
};

/**
 * Renders a list of GSL assemblies as Constructor constructs.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */
const renderBlocks = (assemblyList) => {
  let blockModel = {};
  const gslConstructs = [];
  assemblyList.reverse();
  const projectId = window.constructor.api.projects.projectGetCurrentId();

  for (const assembly of assemblyList) {
    // Create the top level block (construct) and assign it the assembly name
    blockModel = {
      metadata: { name: assembly.name },
      projectId,
    };
    const mainBlock = window.constructor.api.blocks.blockCreate(blockModel);
    window.constructor.api.projects.projectAddConstruct(
      window.constructor.api.projects.projectGetCurrentId(),
      mainBlock.id
    );

    for (const dnaSlice of assembly.dnaSlices) {
      // create blocks inside the construct.
      blockModel = {
        metadata: {
          name: dnaSlice.sliceName !== '' ? dnaSlice.sliceName : dnaSlice.description,
          description: dnaSlice.description,
          start: dnaSlice.destFr,
          end: dnaSlice.destTo,
        },
        projectId,
        rules: {
          role: dnaSlice.breed !== null ? compilerConfig.breeds[dnaSlice.breed] : null,
          hidden: dnaSlice.breed === 'B_LINKER' ? true : false,
        },
        sequence: { initialBases: dnaSlice.dna },
      };
      const block = window.constructor.api.blocks.blockCreate(blockModel);
      window.constructor.api.blocks.blockSetSequence(block.id, dnaSlice.dna);
      window.constructor.api.blocks.blockAddComponent(mainBlock.id, block.id);
    }
    window.constructor.api.blocks.blockFreeze(mainBlock.id);
    gslConstructs.push(mainBlock.id);
  }

  gslState.gslConstructs = gslConstructs;

  return compiler.writeSettings({ 'constructs': gslConstructs }, projectId);
};

/**
 * Reload the existing contructs created by GSL in global state, to associate GSL code with blocks.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */
const reloadStateGSLConstructs = (assemblyList) => {
  const promise = gslState.hasOwnProperty('gslConstructs') ?
    Promise.resolve(null) :
    compiler.loadSettings();

  promise
    .catch(err => {
      console.log('Failed to read the settings file ', err);
      gslState.gslConstructs = [];
    })
    .then(() => {
      removeGSLConstructs();
      renderBlocks(assemblyList);
    });
};

/**
 * Renders blocks created through GSL code.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */
export const render = (assemblyList) => {
  reloadStateGSLConstructs(assemblyList);
};
