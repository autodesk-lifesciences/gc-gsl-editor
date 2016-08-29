import React, { PropTypes, Component } from 'react';

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
    key: PropTypes.number,
    label: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    action: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };
  
  static defaultProps = {
    disabled: false,
  };

	render() {

    let divClasses = 'ToolbarItem' + (this.props.disabled ? ' disabled' : '');
    let linkClass = 'ToolbarItemLink' + (this.props.disabled ? ' disabled' : '');
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
