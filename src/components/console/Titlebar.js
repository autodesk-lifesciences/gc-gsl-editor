import React, { PropTypes, Component } from 'react';
import TitlebarItem from './TitlebarItem';

export default class Titlebar extends Component {

  static propTypes = {
    resultChange: PropTypes.func,
    isVisible: PropTypes.bool.isRequired,
  }

	constructor(props) {
    super(props);
    this.state = {
      isVisible: true,
    };
  }


  render() {
    return (
      <div className="titlebar">
      <div className="titlebarText">
        GSL console
        </div>
         <TitlebarItem label='Clear Console' action={this.props.resultChange.bind(this, '')} imageUrl='/images/ui/close_icon.svg' />
      </div>
      );
  }

}