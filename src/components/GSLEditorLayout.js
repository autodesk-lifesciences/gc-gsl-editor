import React, { PropTypes, Component } from 'react';
import CodeEditorLayout from './editor/CodeEditorLayout';
import ConsoleLayout from './console/ConsoleLayout';
var gslState = require('../../globals');
export default class GSLEditorLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editorContent: '',
      resultContent: '',
      statusContent: '',
      isConsoleOpen: true,
    }
  }

  onEditorContentChange = (content) => {
    this.setState({ editorContent: content });
    gslState.editorContent= content;
  };

  onResultContentChange = (content) => {
    this.setState({ resultContent: content });
    gslState.resultContent = content;
  };

  onStatusContentChange = (content) => {
    this.setState( { statusContent: content});
    gslState.statusContent = content;
  };

  onConsoleStateChange = (value) => {
    this.setState({ isConsoleOpen: value });
    gslState.isConsoleOpen = value;
    setTimeout(() => {window.dispatchEvent(new Event('resize'))}, 40);
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

