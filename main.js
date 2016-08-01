
import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';

function render(container, options) {

  /*var subscriber = window.constructor.store.subscribe(function (state, lastAction) {
    var last = [];
    var current = state.focus.blockIds;
    if (current &&
      current.length &&
        (current.length !== last.length ||
        !current.every(function (item, index) {return item !== last[index]}))
    ) {

      var block = state.blocks[current[0]];
      block.getSequence().then(function (sequence) {
        //console.log(sequence);
      });

      //console.log(current);
      last = current;
    }
  });*/
  ReactDOM.render(<GSLEditorLayout/>, container);
}

window.constructor.extensions.register('gslEditor', render);
