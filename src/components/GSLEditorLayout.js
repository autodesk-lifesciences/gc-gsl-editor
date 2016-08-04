import React, { PropTypes, Component } from 'react';
import CodeEditorLayout from './editor/CodeEditorLayout';
import ConsoleLayout from './console/ConsoleLayout';

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
    window.constructor.store['gslEditor']['editorContent']  = content;
  };

  onResultContentChange = (content) => {
    this.setState({ resultContent: content });
    window.constructor.store['gslEditor']['resultContent'] = content;
  };

  onStatusContentChange = (content) => {
    this.setState( { statusContent: content});
    window.constructor.store['gslEditor']['statusContent'] = content;
  };

  onConsoleStateChange = (value) => {
    this.setState({ isConsoleOpen: value });
    setTimeout(() => {window.dispatchEvent(new Event('resize'))}, 30);
    window.constructor.store['gslEditor']['isConsoleOpen'] = value;
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

