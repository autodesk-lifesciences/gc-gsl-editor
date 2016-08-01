import React, {PropTypes, Component} from 'react';
require('../../styles/styles.css');


export default class Statusbar extends Component {
  static propTypes = {
    message: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      consoleVisible: false,
    }
  }


  toggleConsole = () => {
    console.log("Not implemented: Toggle console visiblity");
  }

  render() {
    return (
      <div className='gslStatusbar'>
        <div className='gslStatusbarText'>
          { this.props.message }  
        </div>
        <div className='gslConsoleButton'>
          <input className='gslConsoleButton' type='button' value='Console' onClick={this.toggleConsole}/>
        </div>
      </div>
    );
  }
}