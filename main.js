
import React from 'react';
import ReactDOM from 'react-dom';
import GSLEditorLayout from './src/components/GSLEditorLayout';

let myvariable = null;
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

  //find out the size of the element we are rendering into
  console.log(options);

  //listen to changes in the Constructor app
  var subscriber = window.constructor.store.subscribe(function storeSubscription(state, lastAction) {

    console.log('The state is ', state);
    console.log('The lastaction is ', lastAction);
    console.log(lastAction.type);

  });
  subscriber();
  ReactDOM.render(<GSLEditorLayout/>, container);
  //return an unsubscribe function to clean up when the extension unmounts
  return function () {
    console.log('i am called when the extension is closed');
    //subscriber();
  };

}

window.constructor.extensions.register('gslEditor', render);
