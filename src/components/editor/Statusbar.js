import React, { Component } from 'react';
import PropTypes from 'prop-types';

require('../../styles/styles.css');

/**
 * Statusbar represents a component to display the current status of the Code editor.
 *
 * Properties:
 *
 * {string} toolbarItems - An array of ToolbarItems that will be rendered
 * {function} showConsole - Function that displays the console window.
 * {bool} isConsoleVisible - True, if the console window is visible.
 */
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
      <div className="Statusbar">
        <div className="StatusbarText">
          { this.props.message }
        </div>
        <input className="StatusbarButton"
          type="button" value="Console"
          onClick={this.props.showConsole}
          style={{ display: this.props.isConsoleVisible ? 'none' : 'block' }}
        />
      </div>
    );
  }
}
