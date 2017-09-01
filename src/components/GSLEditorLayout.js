import React, { Component } from 'react';
import CodeEditorLayout from './editor/CodeEditorLayout';
import ConsoleLayout from './console/ConsoleLayout';
const gslState = require('../globals');

/**
 * GSLEditorLayout groups together the Editor and Output Console Components
 * and manages communication between them.
 */
export default class GSLEditorLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editorContent: '',
      resultContent: '',
      statusContent: '',
      isConsoleOpen: false,
    };
  }

  /**
   * Actions to be performed when the editor content changes.
   * Sets state and saves it globally to be persisted.
   * @param {string} content
   */
  onEditorContentChange = (content) => {
    this.setState({ editorContent: content });
    gslState.editorContent = content;
  };

  /**
   * Actions to be performed when the result content changes.
   * Sets state and saves it globally to be persisted.
   * @param {string} content
   */
  onResultContentChange = (content) => {
    this.setState({ resultContent: content });
    gslState.resultContent = content;
  };

  /**
   * Actions to be performed when the status content changes.
   * Sets state and saves it globally to be persisted.
   * @param {string} content
   */
  onStatusContentChange = (content) => {
    this.setState( { statusContent: content});
    gslState.statusContent = content;
  };

  /**
   * Actions to be performed when console window is expanded or hidden.
   * Sets state and saves it globally to be persisted.
   * @param {string} content
   */
  onConsoleStateChange = (value) => {
    this.setState({ isConsoleOpen: value });
    gslState.isConsoleOpen = value;
    // Needed for scrollbar resize with content.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 40);
  };

  render() {
    return (
      <div className="GSLEditorLayout">
        <CodeEditorLayout
          onSubmit={this.onResultContentChange}
          isConsoleOpen={this.state.isConsoleOpen}
          onToggleConsoleVisibility={this.onConsoleStateChange}
          onEditorContentChange={this.onEditorContentChange}
          onStatusContentChange={this.onStatusContentChange}
        />
        <ConsoleLayout
          resultContent={this.state.resultContent}
          resultChange={this.onResultContentChange}
          isOpen={this.state.isConsoleOpen}
          onToggleConsoleVisibility={this.onConsoleStateChange}
          />
      </div>
    );
  }
}

