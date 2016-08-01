import React, { PropTypes, Component } from 'react';

// Represents an Item on the Toolbar.
export default class ToolbarItem extends Component {

  static propTypes = {
    key: PropTypes.number,
    label: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    action: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
  };
  
  static defaultProps = {
    enabled: true,
  };

	render() {
		return (
			<div
        style={{
          display: 'inline-block',
          lineHeight: '30px',
          verticalAlign: 'center',
          margin: '0px 5px',
          padding: '0px 16px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left',
          backgroundImage: `url(${this.props.imageUrl})`,
          cursor: 'pointer',
        }}
        onClick = {this.props.action}
        enabled = {this.props.enabled}
      > 
        <a id={this.props.label + '-a'}
          style={{
            color: '#757884', //color: '#4c505f',
            textDecoration: 'none',
          }}
          enabled = {this.props.enabled}
        >
          {this.props.label}
        </a>
      </div>
    );
	}       
}