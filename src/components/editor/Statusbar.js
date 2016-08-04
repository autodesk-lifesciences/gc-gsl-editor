import React, {PropTypes, Component} from 'react';

require('../../styles/styles.css');

export default class Statusbar extends Component {
  static propTypes = {
    message: PropTypes.string,
    showConsole: PropTypes.func,
    isConsoleVisible: PropTypes.bool,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='Statusbar'>
        <div className='StatusbarText'>
          { this.props.message }  
        </div>
        <input className='StatusbarButton'
          type='button'value='Console'
          onClick={this.props.showConsole}
          style={{ display: this.props.isConsoleVisible ? 'none' : 'block'  }}
        />
      </div>
    );
  }
}