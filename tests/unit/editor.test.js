import { assert, expect } from 'chai';
import React from 'react';
const TestUtils = require('react-addons-test-utils');
import sd from 'skin-deep';

import Toolbar from '../../src/components/editor/Toolbar';
import ToolbarItem from '../../src/components/editor/ToolbarItem';
import ToolbarMenu from '../../src/components/editor/ToolbarMenu';
import PopupMenu from '../../src/components/editor/PopupMenu';
import MenuItem from '../../src/components/editor/MenuItem';

/* Testing the Toolbar component
 */
describe('Testing Toolbar component', function() {
  // setup the toolbar
  let tree;
  const runFunc = () => {
    return 'Completed Run';
  };

  const saveFunc = () => {
    return 'Completed Save';
  };

  const toolbarItems = [
    {
      label: 'Run',
      action: runFunc,
      imageUrl: '/images/ui/run_icon.svg',
    },
    {
      label: 'Save',
      action: saveFunc,
    },
  ];

  beforeEach(() => {
    tree = sd.shallowRender(React.createElement(Toolbar, {toolbarItems: toolbarItems}));
  });

  it('Creates toolbar items with the required props from an array', function() {
    const items = tree.everySubTree('ToolbarItem');
    assert(items.length > 0, 'The number of items should be greater than 0');
    const item = items[0];
    expect(item.props.label).to.equal('Run');
    expect(item.props.action).to.equal(runFunc);
    expect(item.props.imageUrl).to.equal('/images/ui/run_icon.svg');
    expect(item.props.enabled).to.equal(true, 'The item is enabled by default');
  });

  it('Creates the same number of elements as the array', function() {
    const items = tree.everySubTree('ToolbarItem');
    expect(items.length).to.equal(toolbarItems.length);
  });
});

/* Testing the ToolbarItem component
 */
describe('Testing ToolbarItem component', function() {
  let tree;
  const runFunc = () => {
    return 'Completed Run';
  };
  const itemProps = 
  {
    label: 'Run',
    action: runFunc,
    imageUrl: '/images/ui/run_icon.svg',
    enabled: true,
  };

  beforeEach(() => {
    tree = sd.shallowRender(React.createElement(ToolbarItem, itemProps));
  });

  it('Assigns properties through hash', function() {
    const instance =  tree.getMountedInstance();
    expect(instance.props.label).to.equal('Run');
    expect(instance.props.action).to.equal(runFunc);
    expect(instance.props.imageUrl).to.equal('/images/ui/run_icon.svg');
    expect(instance.props.enabled).to.equal(true);    
  });

  it('Responds with the action clicked', function() {
    const component = tree.getRenderOutput();
    const runReturn = component.props.onClick( {
      preventDefault() {}
    });
    expect(runReturn).to.equal('Completed Run');
  });
});

/* Testing the ToolbarMenu component 
 */
describe('Testing ToolbarMenu component', function() {
  let tree;
  const toggleMenu = () => {
    return 'Toggle Menu';
  };

  const dummyAction = () => {
    return 'Dummy Action';
  }
  const itemProps = 
  {
    isOpen: false,
    position: { "x" : 200, "y": 200},
    changeState: toggleMenu,
    toolbarMenuItems: [
        {
          key: 'my-gsl-file',
          type: 'gsl',
          text: 'gsl file',
          disabled: false,
          action: dummyAction,
        },
        {
          key: 'my-json-file',
          type: 'json',
          text: 'json file',
          disabled: false,
          action: dummyAction,
        },
        {
          key: 'my-ape-zip-file',
          type: 'ape',
          text: 'ape zip file',
          disabled: false,
          action: dummyAction,
        }
    ]
  };

  beforeEach(() => {
    tree = sd.shallowRender(React.createElement(ToolbarMenu, itemProps));
  });

  it('Is closed by default', function() {
    const instance =  tree.getMountedInstance();
    expect(instance.state.isOpen).to.equal(false);  
  });

  it('It shows the popup menu when clicked', function() {
    const instance =  tree.getMountedInstance();
    const result = instance.props.changeState();
    expect(result).to.equal('Toggle Menu');
  });

  it('It creates menu items from an array of a given length', function() {
    const items = tree.everySubTree('PopupMenu');
    expect(items.length).to.equal(1, 'It renders exactly 1 PopupMenu');
    expect(items[0].props.menuItems.length).to.equal(itemProps.toolbarMenuItems.length);
  });
});

/* Testing the PopupMenu component
 */
describe('Testing PopupMenu component', function() {
  let tree;
  const closePopup = () => {
    return 'Close Popup';
  };

  const dummyAction = () => {
    return 'Dummy Action';
  }
  const itemProps = 
  {
    open: false,
    position: { "x" : 200, "y": 200},
    closePopup: closePopup,
    menuItems: [
        {
          key: 'my-gsl-file',
          type: 'gsl',
          text: 'gsl file',
          disabled: false,
          action: dummyAction,
        },
        {
          key: 'my-json-file',
          type: 'json',
          text: 'json file',
          disabled: false,
          action: dummyAction,
        },
        {
          key: 'my-ape-zip-file',
          type: 'ape',
          text: 'ape zip file',
          disabled: false,
          action: dummyAction,
        }
    ]
  };

  beforeEach(() => {
    tree = sd.shallowRender(React.createElement(PopupMenu, itemProps));
  });

  it('Is closed by default', function() {
    const instance =  tree.getMountedInstance();
    expect(instance.props.open).to.equal(false);  
  });

  it('It shows the popup menu when clicked', function() {
    const instance =  tree.getMountedInstance();
    const result = instance.props.closePopup();
    expect(result).to.equal('Close Popup');
  });

  it('It creates menu items from an array of a given length', function() {
    const items = tree.everySubTree('MenuItem');
    expect(items.length).to.equal(3, 'It renders exactly 3 menuItems');
  });
});


/* Testing the MenuItem component
 */
describe('Testing MenuItem component', function() {
  let tree;
  const dummyAction = () => {
    return 'Dummy Action';
  }
  const itemProps = 
  {
    type: 'gsl',
    text: 'gsl file',
    action: dummyAction,
  };

  beforeEach(() => {
    tree = sd.shallowRender(React.createElement(MenuItem, itemProps));
  });

  it('Is enabled by default', function() {
    const instance =  tree.getMountedInstance();
    expect(instance.props.disabled).to.equal(false);  
  });

  it('It shows the popup menu when clicked', function() {
    const instance =  tree.getMountedInstance();
    const result = instance.props.action();
    expect(result).to.equal('Dummy Action');
  });

  it('Has the assigned properties', function() {
    const instance = tree.getMountedInstance();
    expect(instance.props.type).to.equal('gsl');
    expect(instance.props.text).to.equal('gsl file');
    expect(instance.props.disabled).to.equal(false);
    expect(instance.props.action).to.equal(dummyAction);
  });

  it('It contains exactly 1 div', function() {
    const items = tree.everySubTree('div');
    expect(items.length).to.equal(1);
  });
});

