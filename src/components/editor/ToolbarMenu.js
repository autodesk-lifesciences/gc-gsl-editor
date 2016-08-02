import React, {Component, PropTypes} from 'react';
import PopupMenu from './PopupMenu';


export default class ToolbarMenu extends Component {


  static propTypes = {
    isOpen: PropTypes.bool,
    changeState: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      menuPosition: { "x" : 200, "y": 200},
      isOpen: false,
    }
  }

  doAction = () => {
    console.log("TODO: Download. Menu item clicked");
  }

  blockContextMenuItems = () => {
    return [
      {
        text: '.gsl file',
        disabled: false,
        action: this.doAction,
      },
      {
        text: '.json file',
        disabled: false,
        action: this.doAction,
      },
      {
        text: '.ape file',
        disabled: false,
        action: this.doAction,
      },
    ];
  };

  closePopups = (arg) => {
    console.log("The popup was closed");
    this.props.changeState(false);
  }

  render = () => {
    return (
      <PopupMenu
        open={this.props.isOpen}
        position={this.state.menuPosition}
        closePopup={this.closePopups.bind(this)}
        menuItems={this.blockContextMenuItems()}/>
      );
  }
}