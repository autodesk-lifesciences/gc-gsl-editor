import React, { Component, PropTypes } from 'react';

/**
 * MenuItem represents an individual item of the PopupMenu.
 *
 * Properties:
 *
 * {string} text - The text label of the menu item.
 * {function} action - A function to be called when clicked.
 * {bool} disabled - True, if the menu item is disabled.
 * {bool} checked - True, if the menu item is checked.
 * {string} shortcut - Shortcut menu item.
 * {string} classes - A string of classes to be added to the menu item.
 * {string} type - The shorthand type of the menu item.
 */
export default class MenuItem extends Component {
  static propTypes = {
    key: PropTypes.string,
    text: PropTypes.string,
    action: PropTypes.func,
    disabled: PropTypes.bool,
    checked: PropTypes.bool,
    shortcut: PropTypes.string,
    classes: PropTypes.string,
    type: PropTypes.string,
  };

  static defaultProps = {
    disabled: false,
    action: () => {},
  };

  render() {

    const indent = this.props.checked === true || this.props.checked === false;
    let check = null;
    if (indent) {
      check = <div className={this.props.checked ? 'menu-item-checked' : 'menu-item-unchecked'}></div>;
    }
    let classes = 'menu-item' + (this.props.disabled ? ' disabled' : '');
    if (this.props.classes) {
      classes += ` ${this.props.classes}`;
    }
    let itemId = 'download-item-type-' + this.props.type;

    return (
      <div id={itemId} className={classes}
           onClick={(evt) => !this.props.disabled && this.props.action(evt)}>
        {check}
        {this.props.text}
        {this.props.shortcut && (<div className="menu-item-shortcut" disabled={this.props.disabled}>{this.props.shortcut}</div>)}
      </div>
    );
  }
}
