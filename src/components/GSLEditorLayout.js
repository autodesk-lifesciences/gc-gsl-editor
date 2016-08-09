import React, { PropTypes, Component } from 'react';
import CodeEditorLayout from './editor/CodeEditorLayout';
import ConsoleLayout from './console/ConsoleLayout';
import myState from '../../state';
//var myState = require('../../globals');
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
    //myState.editorContent = content;
    window.gslEditor.editorContent = content;
  };

  onResultContentChange = (content) => {
    this.setState({ resultContent: content });
    //myState.resultContent = content;
    //console.log('result is ', content);
    window.gslEditor.resultContent = content;
  };

  onStatusContentChange = (content) => {
    this.setState( { statusContent: content});
    //myState.statusContent = content;
    //console.log('status is ', content);
    window.gslEditor.statusContent = content;
  };

  onConsoleStateChange = (value) => {
    this.setState({ isConsoleOpen: value });
    //myState.isConsoleOpen = value;
    window.gslEditor.onConsoleStatusChange = value;
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

