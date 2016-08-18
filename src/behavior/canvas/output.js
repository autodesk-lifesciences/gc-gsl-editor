const gslState = require('../../../globals');
const extensionConfig = require('../../../package.json');
const compilerConfig = require('../compiler/config.json');

// Removes the GSL constructs
const removeGSLConstructs = () => {
  // read the state and remove the blocks.
  for (var blockId of gslState.gslConstructs) {
    if (window.constructor.api.projects.projectHasComponent(
      window.constructor.api.projects.projectGetCurrentId(),
      blockId)) {
      window.constructor.api.projects.projectRemoveConstruct(
        window.constructor.api.projects.projectGetCurrentId(),
        blockId
      )
    }
  }
}

const renderBlocks = (assemblyList) => {

  let blockModel = {};
  let gslConstructs = [];
  assemblyList.reverse();
  for (const assembly of assemblyList) {
    // Create the top level block (construct) and assign it the assembly name
    blockModel = {
      metadata: { name: assembly.name}
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
          name: dnaSlice.sliceName !== "" ? dnaSlice.sliceName : dnaSlice.description,
          description: dnaSlice.description ,
          start: dnaSlice.destFr,
          end: dnaSlice.destTo
        },
        rules: {
          role: dnaSlice.breed !== null ? compilerConfig.breeds[dnaSlice.breed] : null
        },
        sequence: { initialBases: dnaSlice.dna } // verify if this is needed
      }
      const block = window.constructor.api.blocks.blockCreate(blockModel);
      window.constructor.api.blocks.blockSetSequence(block.id, dnaSlice.dna);
      window.constructor.api.blocks.blockAddComponent(mainBlock.id, block.id);
    }
    window.constructor.api.blocks.blockFreeze(mainBlock.id);
    gslConstructs.push(mainBlock.id);
  }
  // update the state
  gslState.gslConstructs = gslConstructs;
  // write the blocks on the server. 
  window.constructor.extensions.files.write(
    window.constructor.api.projects.projectGetCurrentId(),
    'gslEditor',
    'settings.json',
    JSON.stringify({ 'constructs' : gslConstructs})
  );  
}

const readRemoteFile = (url, assemblyList) => {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) { 
      if (xhr.status === 200) { 
        const allText = xhr.responseText;
        const jsonSettings =  JSON.parse(allText);
        gslState.gslConstructs = jsonSettings.constructs;
        removeGSLConstructs();
        renderBlocks(assemblyList);
      }
    }
  }
  xhr.send(null);
}

const reloadStateGSLConstructs = (assemblyList) => {
  if (!gslState.hasOwnProperty('gslConstructs')) { 
    window.constructor.extensions.files.read(
      window.constructor.api.projects.projectGetCurrentId(),
      'gslEditor',
      'settings.json'
    )
    .then((response) => {
      if (response.status === 200) {
        // read the file and populate the state
        console.log('Reading the settings file.');
        readRemoteFile(response.url, assemblyList);
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

// Renders the blocks created through GSL code.
export const render = (assemblyList) => {
  // Remove the old GSL constructs before adding new ones.
    reloadStateGSLConstructs(assemblyList);
}
