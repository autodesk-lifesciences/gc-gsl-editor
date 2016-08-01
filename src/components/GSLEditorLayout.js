import React, { Component } from 'react';
import CodeEditorLayout from './editor/CodeEditorLayout';
import ConsoleLayout from './console/ConsoleLayout';

export default class GSLEditorLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editorContent: '',
      resultContent: '',
    }
  }

  onEditorContentChange = (content) => {
    this.setState({ editorContent: content });
  };

  onResultContentChange = (content) => {
    this.setState({ resultContent: content });
  };

  render() {

    return (
        <div className="GSLEditorLayout">
          <CodeEditorLayout onSubmit={this.onResultContentChange}/>
          <ConsoleLayout resultContent={this.state.resultContent} resultChange={this.onResultContentChange}/>
        </div>
    );
  }
}