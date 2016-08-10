
// Holds the associations while within the session, prior to saving.
// TODO: Persist this along with any GSL code that should be a part of the project.
let assemblyConstructMap = {}


// Removes the GSL constructs
const removeGSLConstructs = () => {
  // read the state and remove the blocks.
  for (var blockId of window.gslEditor.gslConstructs) {
    if (window.constructor.api.projects.projectHasComponent(
      window.constructor.api.projects.projectGetCurrentId(),
      blockId)) {
      window.constructor.api.projects.projectRemoveConstruct(
        window.constructor.api.projects.projectGetCurrentId(),
        blockId
      )
      //console.log(`Removed ${blockId}`);
    }
  }
}

const renderBlocks = (assemblyList) => {

  let blockModel = {};
  let gslConstructs = [];
  assemblyList.reverse();
  for (const assembly of assemblyList) {

    /*if (assemblyConstructMap.hasOwnProperty(assembly.name)) {
      // focus the existing construct.
      console.log(`Construct exists for ${assembly.name}: ${assemblyConstructMap[assembly.name]}`);
      window.constructor.api.focus.focusBlocks([assemblyConstructMap[assembly.name]]);
      continue;
    }*/
    // Create the top level block (construct) and assign it the assembly name
    blockModel = {
      metadata: { name: assembly.name}
    }
    const mainBlock = window.constructor.api.blocks.blockCreate(blockModel);
    window.constructor.api.projects.projectAddConstruct(
      window.constructor.api.projects.projectGetCurrentId(),
      mainBlock.id
    )

    // associate assembly name with the construct
    assemblyConstructMap[assembly.name] = mainBlock.id;
    for(const dnaSlice of assembly.dnaSlices) {
      // create blocks inside the construct.
      blockModel = {
        metadata: { name: dnaSlice.sliceName != "" ? dnaSlice.sliceName : dnaSlice.description,
                    description: dnaSlice.description ,
                    start: dnaSlice.destFr,
                    end: dnaSlice.destTo
                  },
        sequence: { initialBases: dnaSlice.dna } // verify if this is needed
      }
      const block = window.constructor.api.blocks.blockCreate(blockModel);
      window.constructor.api.blocks.blockSetSequence(block.id, dnaSlice.dna);
      // Add the block as a component to the main block
      window.constructor.api.blocks.blockAddComponent(mainBlock.id, block.id);


    }
    window.constructor.api.blocks.blockFreeze(mainBlock.id);
    gslConstructs.push(mainBlock.id);
  }
   // update the state
    window.gslEditor.gslConstructs = gslConstructs;
      // write the blocks on the server. 
    window.constructor.extensions.files.write(
      window.constructor.api.projects.projectGetCurrentId(),
      'gslEditor',
      'settings.json',
      JSON.stringify({ 'constructs' : gslConstructs})
    );  
}

const readRemoteFile = (url, assemblyList) => {
  var txtFile = new XMLHttpRequest();
  txtFile.open("GET", url, true);
  txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
      if (txtFile.status === 200) {  // Makes sure it's found the file.
        const allText = txtFile.responseText;
        const jsonSettings =  JSON.parse(allText);
        window.gslEditor.gslConstructs = jsonSettings.constructs;
        removeGSLConstructs();
        renderBlocks(assemblyList);
      }
    }
  }
  txtFile.send(null);
}

const reloadStateGSLConstructs = (assemblyList) => {
  if (!window.gslEditor.hasOwnProperty('gslConstructs')) { 
    window.constructor.extensions.files.read(
      window.constructor.api.projects.projectGetCurrentId(),
      'gslEditor',
      'settings.json'
    )
    .then((response) => {
      if (response.status === 200) {
        // read the file and populate the state
        readRemoteFile(response.url, assemblyList);
      }
      else {
        window.gslEditor.gslConstructs = [];
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
