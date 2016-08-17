import React, {PropTypes, Component} from 'react';
import CodeEditorAce from './CodeEditorAce';
import Toolbar from './Toolbar';
import Statusbar from './Statusbar';
import ToolbarMenu from './ToolbarMenu';
import * as compiler from '../../behavior/compiler/client';
import * as canvas from '../../behavior/canvas/output';
const config = require('../../behavior/compiler/config.json');
const extensionConfig = require('../../../package.json');
var gslState = require('../../../globals');

const FileSaver = require('file-saver');

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
      toolbarItems: [
        {
          label: 'Run',
          action: this.runCode,
          imageUrl: '/images/ui/run_icon.svg',
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
      ],
      downloadItems: [
        {
          key: 'my-gsl-file',
          type: 'gsl',
          text: 'gsl file',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'my-json-file',
          type: 'json',
          text: 'json file',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'my-ape-zip-file',
          type: 'ape',
          text: 'ape zip file',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'my-cm-zip-file',
          type: 'cm',
          text: 'cm zip file',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'my-thumper-zip-file',
          type: 'thumper',
          text: 'thumper zip file',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'my-rabit-xls-file',
          type: 'rabitXls',
          text: 'rabit xls file',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'my-txt-file',
          type: 'flat',
          text: 'txt file',
          disabled: false,
          action: this.doDownload,
        },
      ],  
    };
  }

  onEditorContentChange = (content) => {
    this.setState({ editorContent: content });
    this.props.onEditorContentChange(content);
    if (content === '')
      this.onStatusMessageChange('Begin typing GSL code. Drag and drop blocks or GSL commands from the Inventory to use them in a script.');
    else if (this.state.statusMessage.startsWith('Begin'))
      this.onStatusMessageChange(' ');
  }

  onStatusMessageChange = (message) => {
  	this.setState({ statusMessage: message });
    this.props.onStatusContentChange(message)
  }

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

  onDownloadMenuSettingsChange = (settings) => {
    let tempItems = this.state.downloadItems;
    let index = 0;
    for (let item of this.state.downloadItems) {
      tempItems[index].disabled = !settings[item.type];
      // If there is exiting GSL code for this project, enable gsl by default - it could have been autosaved.
      if(item.type == 'gsl') {
        if (gslState.hasOwnProperty(window.constructor.api.project.projectGetCurrentId()) &&
          gslState[window.constructor.api.project.projectGetCurrentId()].hasOwnProperty('savedCode')) {
          tempItems[index].disabled = false;
        }
      }
      index++;
    }

    this.setState( {
      downloadItems: tempItems
    });
  }

  refreshDownloadMenu = () => {
    compiler.getAvailableDownloadList(window.constructor.api.projects.projectGetCurrentId())
    .then((data) => {
      this.onDownloadMenuSettingsChange(data);
    });
  }

  showConsole = () => {
    this.setState( { consoleVisible: true });
    this.props.onToggleConsoleVisibility(this.state.consoleVisible);
    window.dispatchEvent(new Event('resize'));
    this.codeEditor.ace.editor.focus();
  }

  // Runs the GSL code
  runCode = (e) => {
    console.log(`Sending code to the server: ${this.state.editorContent}`);
    this.onStatusMessageChange('Running code...');
    compiler.run(this.state.editorContent, config.arguments, window.constructor.api.projects.projectGetCurrentId()).then((data) => {
      this.onResultContentChange(data.result);
      this.onStatusMessageChange('Program exited with status code: ' + data.status);
      if (data.status == 0) {  // attempt to render in the canvas only if all is well.
        canvas.render(JSON.parse(data.contents));
        this.refreshDownloadMenu();
      }
    });
  }

  saveCode = (e) => {
    window.constructor.extensions.files.write(
      window.constructor.api.projects.projectGetCurrentId(),
      extensionConfig.name,
      'project.gsl',
      this.state.editorContent
    )
    .then(()=> {
      this.onStatusMessageChange('Saved.');
      this.refreshDownloadMenu();
      this.codeEditor.ace.editor.focus();
      if (gslState.hasOwnProperty(window.constructor.api.projects.projectGetCurrentId())) {
        if (gslState[window.constructor.api.projects.projectGetCurrentId()])
        gslState[window.constructor.api.projects.projectGetCurrentId()] = {};
      }
    })
    .catch((err) => {
      this.onStatusMessageChange('Failed to save the GSL code on the server.');
    })
  }

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
    this.codeEditor.ace.editor.focus();
  }

  componentDidMount() {
    this.refreshDownloadMenu();
    if (gslState.hasOwnProperty('editorContent') && this.state.editorContent !== gslState.editorContent) {
      this.onEditorContentChange(gslState.editorContent);
      this.onResultContentChange(gslState.resultContent);
      this.onStatusMessageChange(gslState.statusContent);
    }
  }

  // Toggles comments
  toggleComment = () => {
    const uncomment = function(ace, token, pattern, row) {
      const column = token.value.indexOf(pattern); // + token.start;
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
          uncomment(this.codeEditor.ace, token, '*)', selectionRange.start.row);
          uncomment(this.codeEditor.ace, token, '(*', selectionRange.start.row);
          uncomment(this.codeEditor.ace, token, '//', selectionRange.start.row);
          addComment = false;
        }        
      }

      for(var token of this.codeEditor.ace.editor.session.getTokens(selectionRange.end.row)) {
        if (token.type === 'comment') {
          /*uncomment(this.codeEditor.ace, token, '(*', this.codeEditor.ace.editor.getCursorPosition().end.row);
          uncomment(this.codeEditor.ace, token, '//', this.codeEditor.ace.editor.getCursorPosition().end.row);
          uncomment(this.codeEditor.ace, token, '*)', this.codeEditor.ace.editor.getCursorPosition().end.row);*/
          uncomment(this.codeEditor.ace, token, '(*', selectionRange.end.row);
          uncomment(this.codeEditor.ace, token, '//', selectionRange.end.row);
          uncomment(this.codeEditor.ace, token, '*)', selectionRange.end.row);
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
    this.codeEditor.ace.editor.focus();
  }

  downloadFileByType = (fileType, buttonType) => {
    var hyperlink = document.createElement('a');
    hyperlink.href = '/extensions/api/gslEditor/download?projectId='+ 
      window.constructor.api.projects.projectGetCurrentId() +
      '&extension=gslEditor' + 
      '&type=' + fileType; 

    if (buttonType === 0)  // TODO: Create a separate route for opening the raw file in the browser.
      hyperlink.download = true;

    var mouseEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    hyperlink.dispatchEvent(mouseEvent);
    (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href); 
    this.codeEditor.ace.editor.focus();
  }

  doDownload = (evt) => {
    // TODO: Associate with something other than label!
    const fileMap = {
      'gsl file' : 'gsl',
      'json file' : 'json',
      'ape zip file' : 'ape',
      'cm zip file' : 'cm',
      'thumper zip file' : 'thumper',
      'rabit xls file': 'rabitXls',
      'txt file': 'flat',
    }
    const buttonType = evt.nativeEvent.button;

    for (let key of Object.keys(fileMap)) {
      // TODO: Create route to check if file exists on server.
      // Disable menu options accordingly.
      if (evt.target.innerHTML.indexOf(key) !== -1) {
          setTimeout(() => {
            this.onStatusMessageChange('');
          }, 2000);
          this.onStatusMessageChange('Preparing to download the ' + key + ' associated with this project...');
          this.downloadFileByType(fileMap[key], buttonType);
      }
    }
    this.codeEditor.ace.editor.focus();
  }

  render() {
    return (
        <div className="CodeEditorLayout">
          <Toolbar toolbarItems={this.state.toolbarItems} />
          <ToolbarMenu
            isOpen={this.state.showDownloadMenu}
            changeState={this.onMenuToggle}
            position={this.state.currentMenuPosition}
            toolbarMenuItems={this.state.downloadItems}/>
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
