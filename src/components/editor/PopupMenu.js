import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import invariant from 'invariant';

/**
 * PopupMenu represents a rectangular menu or submenu drawn as a part of the
 * ToolbarMenu.
 *
 * Properties:
 *
 * {bool} open - True, if the PopupMenu is open/visible.
 * {function} closePopup - A function to close the PopupMenu
 * {array} menuItems - An array of MenuItems to be displayed in the PopupMenu
 * {object} position - Position at which the popup menu will be drawn.
 */

export default class PopupMenu extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    closePopup: PropTypes.func.isRequired,
    menuItems: PropTypes.array.isRequired,
    position: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.listener = window.addEventListener('resize', (evt) => {
      this.props.closePopup();
    });
  }

  /**
   * Closes the menu on mouse down outside the menu.
   * @param {MouseEvent} click event
   */
  onMouseDown(evt) {
    const blockEl = ReactDOM.findDOMNode(this.refs.blocker);
    if (evt.target === blockEl) {
      this.props.closePopup();
    }
  }

  renderMenu() {
    if (this.props.open) {
      const menuItems = this.props.menuItems.map((item, index) => {
        return {
          key: item.key,
          text: item.text,
          action: function(evt) {
            console.log('action evt', evt);
            this.props.closePopup();
            if (item.action) {
              return item.action(evt);
            }
          }.bind(this),
          disabled: item.disabled,
          classes: item.classes,
          checked: item.checked,
          index: index,
        };
      });

      const showMenu = window.constructor.api.ui.uiShowMenu;
      invariant(showMenu, 'expected uiShowMenu api to be available');
      showMenu(menuItems, {
        x: this.props.position.x,
        y: this.props.position.y,
      });
    }
  }

  render() {
    return React.DOM.div({
      onMouseDown: this.onMouseDown.bind(this),
      style: {},
      ref: "blocker",
    }, [
      this.renderMenu(),
    ]);
  }
}
