import React, { PropTypes, Component } from 'react';

// Represents an Item on the Toolbar.
export default class TitlebarItem extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    action: PropTypes.func.isRequired,
  };


	render() {
		return (
			<div className="TitleBarItem"
        style={{backgroundImage: `url(${this.props.imageUrl})` }}
        onClick = {this.props.action} > 
        <span>{this.props.label}</span>
      </div>
    );
	}       
}