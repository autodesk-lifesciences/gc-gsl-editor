/**
 * Defines how the GSL assemblies are rendered on the canvas.
 */
const compilerConfig = require('../compiler/config.json');
const PRIMER_CSV_INDEX = ['Name', 'Id', 'fwd', 'rev', 'fwdtail', 'fwdbody', 'revtail', 'revbody', 'fwdbridge', 'revbridge', 'fwdanneal', 'fwdsandwich', 'fwdamp', 'revanneal', 'revsandwich', 'revamp', 'fwdannealTm', 'fwdampTm', 'revannealTm', 'revampTm'].reduce((map, val, index) => {
  map[val] = index;
  return map;
}, {});
/**
 * Removes the GSL constructs from the canvas, based on which constructs are frozen
 */
const removeGSLConstructs = () => {
  const projectId = window.constructor.api.projects.projectGetCurrentId();
  const constructIds = window.constructor.api.projects.projectGet(projectId).components;
  const constructs = constructIds.map(constructId => window.constructor.api.blocks.blockGet(constructId));
  //remove the constructs we generate (frozen) and empty ones (in case project had one to start)
  const toRemove = constructs.filter(block => block.isFrozen() || block.components.length === 0);
  toRemove.forEach(block => window.constructor.api.projects.projectRemoveConstruct(projectId, block.id));
};

/**
 * Renders a list of GSL assemblies as Constructor constructs.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */
const renderBlocks = (assemblyList, primersCsv) => {
  assemblyList.reverse();
  const projectId = window.constructor.api.projects.projectGetCurrentId();

  for (const assembly of assemblyList) {
    // track blocks (dnaSlice) to put in construct (assembly)
    const components = [];

    let dnaSequence = '';

    for (const dnaSlice of assembly.dnaSlices) {
      // create blocks inside the construct.
      const block = window.constructor.api.blocks.blockCreate({
        projectId,
        metadata: {
          name: dnaSlice.sliceName !== '' ? dnaSlice.sliceName : dnaSlice.description,
          description: dnaSlice.description,
          start: dnaSlice.destFr,
          end: dnaSlice.destTo,
        },
        rules: {
          role: dnaSlice.breed !== null ? compilerConfig.breeds[dnaSlice.breed] : null,
          hidden: dnaSlice.breed === 'B_LINKER',
          direction: dnaSlice.destFwd ? 'forward' : 'reverse',
        },
        sequence: { initialBases: dnaSlice.dna },
      });

      components.push(block.id);

      //this is async, but we'll just trust that it works...
      window.constructor.api.blocks.blockSetSequence(block.id, dnaSlice.dna);
      dnaSequence += dnaSlice.dna;
    }

    // Create the top level block (construct) and assign it the assembly name
    const mainBlock = window.constructor.api.blocks.blockCreate({
      metadata: { name: assembly.name },
      projectId,
      components,
    });

    //Primers?
    const primers = [];
    if (primersCsv && primersCsv.length > 1) {
      for (let i = 2; i < primersCsv.length; i += 1) {
        if (primersCsv[i] === undefined) {
          continue;
        }
        const fwd = primersCsv[i][PRIMER_CSV_INDEX.fwd];
        if (fwd && fwd.length > 5) {
          const primerIndex = dnaSequence.indexOf(fwd);
          if (primerIndex > -1) {
            //position,forward,overhangLength
            const id = `${true ? 'F' : 'R'}_${mainBlock.id}`;
            primers.push({
              sequence: fwd,
              info: {
                id,
                position: primerIndex,
                forward: true,
                overhangLength: 0,
              },
            });
          }
        }
      }
    }

    window.constructor.api.projects.projectAddConstruct(projectId, mainBlock.id);

    if (primers.length > 0) {
      console.log('Adding primers:', primers);
      window.constructor.api.primers.addPrimers(mainBlock.id, primers);
    }

    window.constructor.api.blocks.blockFreeze(mainBlock.id);
    //Focus on the most recent construct created
    window.constructor.api.focus.focusConstruct(mainBlock.id);
  }
};

/**
 * Renders blocks created through GSL code.
 * Reload the existing contructs created by GSL in global state, to associate GSL code with blocks.
 * @param {array} assemblyList - List of objects describing GSL assemblies.
 */
export const render = (assemblyList, primers) => {
  removeGSLConstructs();
  return renderBlocks(assemblyList, primers);
};
