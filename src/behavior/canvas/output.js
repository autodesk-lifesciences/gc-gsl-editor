
// Holds the associations while within the session, prior to saving.
// TODO: Persist this along with any GSL code that should be a part of the project.
let assemblyConstructMap = {}

export const render = (assemblyList) => {
  let blockModel = {};
	for (const assembly of assemblyList) {

    if (assemblyConstructMap.hasOwnProperty(assembly.name)) {
      // focus the existing construct.
      console.log(`Construct exists for ${assembly.name}: ${assemblyConstructMap[assembly.name]}`);
      window.constructor.api.focus.focusBlocks([assemblyConstructMap[assembly.name]]);
      continue;
    }
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
	}
}

