/**
 * Defines how the GSL assemblies are rendered on the canvas.
 */ 

const gslState = require('../../../globals');
const extensionConfig = require('../../../package.json');
const compilerConfig = require('../compiler/config.json');

/**
 * Removes the GSL constructs from the canvas based on the output
 */ 
const removeGSLConstructs = () => {
  for (var blockId of gslState.gslConstructs) {
    if (window.constructor.api.projects.projectHasComponent(
      window.constructor.api.projects.projectGetCurrentId(),
      blockId)) {
      window.constructor.api.projects.projectRemoveConstruct(
        window.constructor.api.projects.projectGetCurrentId(),
        blockId
      );
    }
  }
}

/**
 * Renders a list of GSL assemblies as Constructor constructs.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */ 
const renderBlocks = (assemblyList) => {

  let blockModel = {};
  let gslConstructs = [];
  assemblyList.reverse();

  for (const assembly of assemblyList) {
    // Create the top level block (construct) and assign it the assembly name
    blockModel = {
      metadata: { name: assembly.name},
    }
    const mainBlock = window.constructor.api.blocks.blockCreate(blockModel);
    window.constructor.api.projects.projectAddConstruct(
      window.constructor.api.projects.projectGetCurrentId(),
      mainBlock.id
    )

    for(const dnaSlice of assembly.dnaSlices) {
      // create blocks inside the construct.
      blockModel = {
        metadata: {
          name: dnaSlice.sliceName !== '' ? dnaSlice.sliceName : dnaSlice.description,
          description: dnaSlice.description,
          start: dnaSlice.destFr,
          end: dnaSlice.destTo,
        },
        rules: {
          role: dnaSlice.breed !== null ? compilerConfig.breeds[dnaSlice.breed] : null,
        },
        sequence: { initialBases: dnaSlice.dna }
      }
      const block = window.constructor.api.blocks.blockCreate(blockModel);
      window.constructor.api.blocks.blockSetSequence(block.id, dnaSlice.dna);
      window.constructor.api.blocks.blockAddComponent(mainBlock.id, block.id);
    }
    window.constructor.api.blocks.blockFreeze(mainBlock.id);
    gslConstructs.push(mainBlock.id);
  }

  gslState.gslConstructs = gslConstructs;

  window.constructor.extensions.files.write(
    window.constructor.api.projects.projectGetCurrentId(),
    extensionConfig.name,
    'settings.json',
    JSON.stringify({'constructs': gslConstructs})
  );
}

/**
 * Reads remote settings file - containing a list of GSL constructs in the project
 * @param {string} file url
 */ 
const readRemoteFile = (url) => {
  new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const allText = xhr.responseText;
          resolve(allText);
        }
        else {
          reject();
        }
      }
    }
    xhr.send(null);
  });
}

/**
 * Reload the existing contructs created by GSL in global state, to associate GSL code with blocks.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */ 
const reloadStateGSLConstructs = (assemblyList) => {
  if (!gslState.hasOwnProperty('gslConstructs')) {
    window.constructor.extensions.files.read(
      window.constructor.api.projects.projectGetCurrentId(),
      extensionConfig.name,
      'settings.json'
    )
    .then((response) => {
      if (response.status === 200) {
        // read the file and populate the state
        readRemoteFile(response.url)
        .then((allText) => {
          const jsonSettings = JSON.parse(allText);
          gslState.gslConstructs = jsonSettings.constructs;
          removeGSLConstructs();
          renderBlocks(assemblyList);
        })
        .catch((err) => {
          console.log('Failed to read the settings file ', err);
          renderBlocks(assemblyList);
        });
      }
      else {
        gslState.gslConstructs = [];
      }
    })
    .catch((err) => {
      // No settings file yet. Silently render blocks
      renderBlocks(assemblyList);
    });
  }
  else {
    removeGSLConstructs();
    renderBlocks(assemblyList);
  }
}

/**
 * Renders blocks created through GSL code.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */ 
export const render = (assemblyList) => {
  reloadStateGSLConstructs(assemblyList);
}
