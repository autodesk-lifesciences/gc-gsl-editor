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
			<div
        style={{
          display: 'inline-block',
          lineHeight: '30px',
          verticalAlign: 'center',
          margin: '0px 5px',
          padding: '0px 20px 0px 60px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right',
          backgroundImage: `url(${this.props.imageUrl})`,
          cursor: 'pointer',
          float: 'right',
        }}
        onClick = {this.props.action} > 
        <a
          style={{
            color: '#EEEEEE', //color: '#4c505f',
            textAlign: 'left',
          }} >
          {this.props.label}
        </a>
      </div>
    );
	}       
}