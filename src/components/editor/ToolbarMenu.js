import React, {Component, PropTypes} from 'react';
import PopupMenu from './PopupMenu';

/**
 * ToolbarMenu class represents an instance of a dropdown menu .
 * Properties:
 *
 * {bool} isOpen - true if the dropdown menu is open.
 * {object} position - the position at which the dropdown should be drawn.
 * {function} changeState - function to be called when the menu is toggled.
 * {array} toolbarMenuItems - array of menu items
 */
export default class ToolbarMenu extends Component {

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    position: PropTypes.object.isRequired,
    changeState: PropTypes.func,
    toolbarMenuItems: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        key: PropTypes.string,
        text: PropTypes.string,
        action: PropTypes.func,
        disabled: PropTypes.bool,
      })
    ),
  }
  constructor(props) {
    super(props);
    this.state = {
      menuPosition: { 'x': 200, 'y': 200},
      isOpen: false,
    };
  }

  /**
   * Closes the popup menu.
   * @param {ToolbarMenu} this
   */
  closePopups = () => {
    this.props.changeState(false);
  }

  render = () => {
    return (
      <PopupMenu
        open={this.props.isOpen}
        position={this.props.position}
        closePopup={this.closePopups}
        menuItems={this.props.toolbarMenuItems}/>
    );
  }
}
