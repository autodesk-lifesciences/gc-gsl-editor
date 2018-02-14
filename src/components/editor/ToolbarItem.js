import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * ToolbarItem represents an item on the Toolbar.
 * Properties:
 *
 * {string} label - item label
 * {string} imageUrl - url of the image icon
 * {function} action - function to be called when clicked
 * {bool} disabled - whether the item is disabled
 */
export default class ToolbarItem extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    action: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
  };

  render() {
    const divClasses = 'ToolbarItem' + (this.props.disabled ? ' disabled' : '');
    const linkClass = 'ToolbarItemLink' + (this.props.disabled ? ' disabled' : '');
    return (
      <div className={divClasses}
        style={{ backgroundImage: `url(${this.props.imageUrl})`}}
        onClick = {this.props.action}>
        <a className={linkClass} id={this.props.label + '-a'}>
          {this.props.label}
        </a>
      </div>
    );
  }
}
