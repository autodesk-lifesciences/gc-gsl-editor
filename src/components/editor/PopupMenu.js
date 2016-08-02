import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import MenuItem from './MenuItem';

export default class PopupMenu extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    closePopup: PropTypes.func.isRequired,
    menuItems: PropTypes.array.isRequired,
    position: PropTypes.object.isRequired,
  };

  // mouse down on the blocker closes the modal
  onMouseDown(evt) {
    const blockEl = ReactDOM.findDOMNode(this.refs.blocker);
    if (evt.target === blockEl) {
      this.props.closePopup();
    }
  }

  render() {
    // set position from properties
    const position = {
      left: `${this.props.position.x}px`,
      top: `${this.props.position.y}px`,
    };
    return (
      <div
        onMouseDown={this.onMouseDown.bind(this)}
        className={this.props.open ? 'menu-popup-blocker-visible' : 'menu-popup-blocker-hidden'}
        style={this.props.style || {}}
        ref="blocker"
      >
        <div className="menu-popup-container" style={position}>
          {this.props.menuItems.map((item, index) => {
            const boundAction = (evt) => {
              this.props.closePopup();
              if (item.action) {
                item.action(evt);
              }
            };
            return (
                (<MenuItem key={item.text}
                           disabled={item.disabled}
                           classes={item.classes}
                           text={item.text}
                           action={boundAction}
                           checked={item.checked}/>)
            );
          })}
        </div>
      </div>
    );
  }
}
