import React, {PropTypes, Component} from 'react';
import CodeEditorAce from './CodeEditorAce';
import Toolbar from './Toolbar';
import Statusbar from './Statusbar';
import * as compiler from '../../behavior/compiler/client';
import * as canvas from '../../behavior/canvas/output';
const config = require('../../behavior/compiler/config.json');

export default class CodeEditorLayout extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      editorContent: '',
      resultContent: '',
      statusMessage: 'Begin typing GSL code. Drag and drop blocks or GSL commands from the Inventory to use them in a script.',
    };
  }

  onEditorContentChange = (content) => {
    this.setState({ editorContent: content });
  };

  onStatusMessageChange = (message) => {
  	this.setState({ statusMessage: message });
  };

  onResultContentChange = (result) => {
    this.setState({ resultContent: result });
    this.props.onSubmit(result);
  }

  // Runs the GSL code
  runCode = (e) => {
    console.log(`Sending code to the server: ${this.state.editorContent}`);
    this.onStatusMessageChange('Running code...');
    compiler.run(this.state.editorContent, config.arguments).then((data) => {
      this.onResultContentChange(data.result);
      this.onStatusMessageChange('Program exited with status code: ' + data.status);
      if (data.status == 0)   // attempt to render in the canvas only if all is well.
        canvas.render(JSON.parse(data.contents))
    });
  };

  downloadFile = () => {
    const textType = 'text/plain';
    const name = 'snippet.gsl';
    var a = document.getElementById("Download-a");
    let file = new Blob([this.state.editorContent], {type: textType});
    a.href = URL.createObjectURL(file);
    a.download = name;
  }

  showGSLLibrary = () => {
    window.constructor.api.ui.inventoryToggleVisibility(true);
    window.constructor.api.ui.inventorySelectTab('gsl');
  }

  // Toggles comments
  toggleComment = () => {

    const uncomment = function(ace, token, pattern, row) {
      const column = token.value.indexOf(pattern) + token.start;
      console.log('pattern: ',pattern, ' column:', column);
      if (token.value.indexOf(pattern) != -1) {
        ace.editor.session.replace({
          start: { row: row, column: column },
          end: {row: row, column: column+2}
        }, '');
      }
    };
    const selectionRange = this.codeEditor.ace.editor.selection.getRange();
    if(this.codeEditor.ace.editor.getSelectedText() !== '') {
      // multi-line comments
      let addComment = true;


      for (var token of this.codeEditor.ace.editor.session.getTokens(selectionRange.start.row)) {
        if (token.type === 'comment') {
          uncomment(this.codeEditor.ace, token, '(*', selectionRange.start.row);
          uncomment(this.codeEditor.ace, token, '//', selectionRange.start.row);
          uncomment(this.codeEditor.ace, token, '*)', selectionRange.start.row);
          addComment = false;
        }        
      }


      for(var token of this.codeEditor.ace.editor.session.getTokens(selectionRange.end.row)) {
        if (token.type === 'comment') {
          uncomment(this.codeEditor.ace, token, '(*', this.codeEditor.ace.editor.getCursorPosition().end.row);
          uncomment(this.codeEditor.ace, token, '//', this.codeEditor.ace.editor.getCursorPosition().end.row);
          uncomment(this.codeEditor.ace, token, '*)', this.codeEditor.ace.editor.getCursorPosition().end.row);
          addComment = false;
        }        
      }

      if (addComment) {
        this.codeEditor.ace.editor.env.document.insert(selectionRange.start, '(*');
        this.codeEditor.ace.editor.env.document.insert(this.codeEditor.ace.editor.selection.getRange().end, '*)');
      }
    }
    else {
      // single-line comments
      let addComment = true;
      const cursorRow = this.codeEditor.ace.editor.getCursorPosition().row;
      for(var token of this.codeEditor.ace.editor.session.getTokens(cursorRow)) {
        if (token.type === 'comment') {
          uncomment(this.codeEditor.ace, token, '(*', cursorRow);
          uncomment(this.codeEditor.ace, token, '//', cursorRow);
          uncomment(this.codeEditor.ace, token, '*)', cursorRow);
          addComment = false;
        }           
      }
      if (addComment)     
        this.codeEditor.ace.editor.env.document.insert(this.codeEditor.ace.editor.getCursorPosition(), '//'); 
    }
  }

  // Make the toolbar items.
  getToolbarItems = () => {
    return [
      {
        label: 'Run',
        action: this.runCode,
        imageUrl: '/images/ui/run_icon.svg'
      },
      {
        label: 'GSL Library',
        action: this.showGSLLibrary,
        imageUrl: '/images/ui/add_icon.svg'
      },
      {
        label: 'Comment',
        action: this.toggleComment,
      },
      {
        label: 'Download',
        action: this.downloadFile,
        imageUrl: '/images/ui/download_icon.svg'
      }
    ]
  };

  render() {
    const divStyle = {
      width: '100%',
      height: '60%',
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-block',
    };
    let editorComponent;
    return (
        <div className="CodeEditorLayout" style={divStyle}>
          <Toolbar 
            toolbarItems={this.getToolbarItems()} />
          <CodeEditorAce 
            ref = {(el) => {
                if (el) {
                  this.codeEditor = el;
                }
              }
            }
          	callbackParent={this.onEditorContentChange} 
          	value={this.state.editorContent} />
          <Statusbar message={this.state.statusMessage}/>
        </div>
    );
  }
}
