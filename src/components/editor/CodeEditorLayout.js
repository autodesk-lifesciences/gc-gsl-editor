import React, {PropTypes, Component} from 'react';
import CodeEditorAce from './CodeEditorAce';
import Toolbar from './Toolbar';
import Statusbar from './Statusbar';
import ToolbarMenu from './ToolbarMenu';
import * as compiler from '../../behavior/compiler/client';
import * as canvas from '../../behavior/canvas/output';
const config = require('../../behavior/compiler/config.json');
const extensionConfig = require('../../../package.json');
import myState from '../../../state';

export default class CodeEditorLayout extends Component {
  static propTypes = {
    onEditorContentChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onToggleConsoleVisibility: PropTypes.func.isRequired,
    onStatusContentChange:PropTypes.func.isRequired,
    isConsoleOpen: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      editorContent: '',
      resultContent: '',
      statusMessage: 'Begin typing GSL code. Drag and drop blocks or GSL commands from the Inventory to use them in a script.',
      showDownloadMenu: false,
      currentMenuPosition: {},
      consoleVisible: true,
    };
  }

  onEditorContentChange = (content) => {
    this.setState({ editorContent: content });
    this.props.onEditorContentChange(content);
    if (content === '')
      this.onStatusMessageChange('Begin typing GSL code. Drag and drop blocks or GSL commands from the Inventory to use them in a script.');
    else if (this.state.statusMessage.startsWith('Begin'))
      this.onStatusMessageChange(' ');
  };

  onStatusMessageChange = (message) => {
  	this.setState({ statusMessage: message });
    this.props.onStatusContentChange(message)
  };

  onResultContentChange = (result) => {
    this.setState({ resultContent: result });
    this.props.onSubmit(result);
  }

  onMenuToggle = (value) => {
    this.setState( {
      showDownloadMenu: value
    });
  }

  onMenuPositionSet = (value) => {
    this.setState( {
      currentMenuPosition: value
    });
  }

  showConsole = () => {
    this.setState( { consoleVisible: true });
    this.props.onToggleConsoleVisibility(this.state.consoleVisible);
    window.dispatchEvent(new Event('resize'));
  }

  // Runs the GSL code
  runCode = (e) => {
    console.log(`Sending code to the server: ${this.state.editorContent}`);
    this.onStatusMessageChange('Running code...');
    compiler.run(this.state.editorContent, config.arguments, window.constructor.api.projects.projectGetCurrentId()).then((data) => {
      this.onResultContentChange(data.result);
      this.onStatusMessageChange('Program exited with status code: ' + data.status);
      if (data.status == 0)   // attempt to render in the canvas only if all is well.
        canvas.render(JSON.parse(data.contents))
    });
  };

  saveCode = (e) => {
    window.constructor.extensions.files.write(
      window.constructor.api.projects.projectGetCurrentId(),
      extensionConfig.name,
      'project.gsl',
      this.state.editorContent
    )
    .then(()=> {
      this.onStatusMessageChange('Saved.');
    })
    .catch((err) => {
      this.onStatusMessageChange('Failed to save the GSL code on the server.');
    })
  };

  downloadFile = (e) => {
    this.onMenuToggle(true);
    this.onMenuPositionSet({
      'x': e.target.getBoundingClientRect().left-10,
      'y': e.target.getBoundingClientRect().bottom+10
    })
  }

  showGSLLibrary = () => {
    window.constructor.api.ui.inventoryToggleVisibility(true);
    window.constructor.api.ui.inventorySelectTab('gsl');
  }

  componentDidMount() {
      // console.log('coming here');
        //       this.onEditorContentChange(myState.editorContent);
      //this.onResultContentChange(myState.resultContent);
      //this.onStatusMessageChange(myState.statusContent);
    if (window.constructor.store['gslEditor'].hasOwnProperty('editorContent') && this.state.editorContent !== window.constructor.store['gslEditor'].editorContent) {
      this.onEditorContentChange(window.constructor.store['gslEditor'].editorContent);
      this.onResultContentChange(window.constructor.store['gslEditor'].resultContent);
      this.onStatusMessageChange(window.constructor.store['gslEditor'].statusContent);

    }
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
        imageUrl: '/images/ui/run_icon.svg',
        enabled: this.state.editorContent === '' ? false : true, 
      },
      {
        label: 'Save',
        action: this.saveCode,
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
  }

  downloadGslFile = () => {
    const textType = 'text/plain';
    const name = 'snippet.gsl';
    var a = document.getElementById("Download-a");
    let file = new Blob([this.state.editorContent], {type: textType});
    a.href = URL.createObjectURL(file);
    a.download = name;
  }

  downloadZipFile = () => {
    var sampleBytes = new Int8Array(4096);

    var saveByteArray = (function () {  
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      window.constructor.extensions.files.read()
      return function (data, name) {
        var blob = new Blob(data, {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
      };
    }());
  }

  saveToDisk = (fileUrl, fileName, buttonType) => {
      var hyperlink = document.createElement('a');
      hyperlink.href = fileUrl;
      hyperlink.target = '_blank';
      hyperlink.type = 'text/plain';
      if (buttonType === 0)  // left click results in download else opens the file.
        hyperlink.download = fileName || fileUrl;

      var mouseEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
      });

      hyperlink.dispatchEvent(mouseEvent);
      (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
    }

  /* TODO: Bad. Make this configuable */
  downloadFileItem = (evt) => { 
    const fileMap = {
      'gsl file' : 'project.gsl',
      'json file' : 'gslOut.json',
      'ape file ' : 'gslOut.0.ape',
      'ape zip file' : 'gslOut.ape.zip',
      'txt file': 'gslOutFlat.txt',
    }
    console.log('Coming here');
    const buttonType = evt.nativeEvent.button;

    for (let key of Object.keys(fileMap)) {
      if (evt.target.innerHTML.indexOf(key) !== -1) {
        window.constructor.extensions.files.read(
          window.constructor.api.projects.projectGetCurrentId(),
          extensionConfig.name,
          fileMap[key]
        )
        .then((response) => {
          setTimeout(() => {
            this.onStatusMessageChange('');
          }, 2000);
          this.onStatusMessageChange('Preparing to download the ' + key + ' associated with this project...');
          console.log('The response is ', response);
          this.saveToDisk(response.url, fileMap[key], buttonType);
        })
        .catch((err) => {
          setTimeout(() => {
            this.onStatusMessageChange('');
          }, 5000);
          this.onStatusMessageChange('Sorry, could not find a valid ' + key + ' associated with this project.');
          console.log(err);
        })
      }
    }
  }

  downloadMenuItems = () => {
    return [
      {
        key: 'my-gsl-file',
        text: 'gsl file',
        disabled: false,
        action: this.downloadFileItem,
      },
      {
        key: 'my-json-file',
        text: 'json file',
        disabled: false,
        action: this.downloadFileItem,
      },
      {
        key: 'my-ape-file',
        text: 'ape file',
        disabled: false,
        action: this.downloadFileItem,
      },
      {
        key: 'my-ape-zip-file',
        text: 'ape zip file',
        disabled: false,
        action: this.downloadFileItem,
      },
      {
        key: 'my-txt-file',
        text: 'txt file',
        disabled: false,
        action: this.downloadFileItem,
      },
    ];
  };

  render() {
    let editorComponent;
    return (
        <div className="CodeEditorLayout">
          <Toolbar toolbarItems={this.getToolbarItems()} />
          <ToolbarMenu
            isOpen={this.state.showDownloadMenu}
            changeState={this.onMenuToggle}
            position={this.state.currentMenuPosition}
            toolbarMenuItems={this.downloadMenuItems()}/>
          <CodeEditorAce 
            ref = {(el) => {
                if (el) {
                  this.codeEditor = el;
                }
              }
            }
          	callbackParent={this.onEditorContentChange} 
          	value={this.state.editorContent}/>
          <Statusbar
            message={this.state.statusMessage}
            showConsole={this.showConsole}
            isConsoleVisible={this.props.isConsoleOpen}/>
        </div>
    );
  }
}
