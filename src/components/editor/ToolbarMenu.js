import React, {Component, PropTypes} from 'react';
import PopupMenu from './PopupMenu';


export default class ToolbarMenu extends Component {

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    position: PropTypes.object.isRequired,
    changeState: PropTypes.func,
    toolbarMenuItems: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        key: PropTypes.string,
        text: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
        disabled: PropTypes.bool
      })
    ),
  }
  constructor(props) {
    super(props);
    this.state = {
      menuPosition: { "x" : 200, "y": 200},
      isOpen: false,
    };
  }

  closePopups = (arg) => {
    this.props.changeState(false);
  }

  render = () => {
    return (
      <PopupMenu
        open={this.props.isOpen}
        position={this.props.position}
        closePopup={this.closePopups.bind(this)}
        menuItems={this.props.toolbarMenuItems}/>
    );
  }
}
