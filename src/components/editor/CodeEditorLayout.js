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
          disabled: false,  // Make sure to update index references in saveCode if items are rearranged.
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
          key: 'download-gsl-file',
          type: 'gsl',
          text: 'Source GSL',
          disabled: false,
          action: this.doDownload,
        },
        {
        },
        {
          key: 'download-ape-zip-file',
          type: 'ape',
          text: 'Output as ApE file archive',
          disabled: false,
          action: this.doDownload,
        },
        {
          key: 'download-cm-zip-file',
          type: 'cm',
          text: 'Output as Clone Manager file achive',
          disabled: false,
          action: this.doDownload,
        },
        {
        },
        {
          key: 'download-allFormats-zip-file',
          type: 'allFormats',
          text: 'All formats',
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
    else
      this.onStatusMessageChange(' ');

    // enable/disable the 'Save' button based on the content.
    const projectId = window.constructor.api.projects.projectGetCurrentId();
    if (gslState.hasOwnProperty(projectId)) {
      let items = this.state.toolbarItems;
      if (gslState[projectId].hasOwnProperty('savedCode')) {
        if (content == gslState[projectId].savedCode) {
            items[1].disabled = true;
            this.setState( { toolbarItems: items});
        } else {
            items[1].disabled = false;
            this.setState( { toolbarItems: items});
        }
      }
      else {
          items[1].disabled = false;
          this.setState( { toolbarItems: items})
      }
    }
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
    gslState.isConsoleOpen = true;
    window.dispatchEvent(new Event('resize'));
    this.codeEditor.ace.editor.focus();
  }

  // Runs the GSL code
  runCode = (e) => {
    console.log(`Sending code to the server: ${this.state.editorContent}`);
    this.onStatusMessageChange('Running code...');
    compiler.run(this.state.editorContent, config.arguments, window.constructor.api.projects.projectGetCurrentId()).then((data) => {
      this.onResultContentChange(data.result);
      if (data.status === 0) {
        this.onStatusMessageChange('Code executed successfully.');
      } else {
        this.onStatusMessageChange('Running this code resulted in errors. Please check the console for details.');
        this.showConsole();
      }
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
    .then(() => {
      this.onStatusMessageChange('Saved.');
      this.refreshDownloadMenu();
      this.codeEditor.ace.editor.focus();
      let projectId = window.constructor.api.projects.projectGetCurrentId();
      if (!gslState.hasOwnProperty(projectId))
        gslState[projectId] = {};
      gslState[projectId].savedCode = this.state.editorContent;
      // disable the 'Save' Button
      let items = this.state.toolbarItems;
      if (gslState[projectId].hasOwnProperty('savedCode')) {
        items[1].disabled = true;
        this.setState( { toolbarItems: items});
      }
    })
    .catch((err) => {
      this.onStatusMessageChange('Failed to save the GSL code on the server.');
    })
  }

  downloadFile = (e) => {
    this.onMenuToggle(true);
    //TODO: Find a better way to do this
    let offsetLeft = -6;
    let offsetBottom = 0;
    if (e.target.className === 'ToolbarItemLink') {
      offsetLeft = 10;
      offsetBottom = 8;
    }
    this.onMenuPositionSet({
      'x': e.target.getBoundingClientRect().left-offsetLeft,
      'y': e.target.getBoundingClientRect().bottom+offsetBottom
    })    
  }

  showGSLLibrary = () => {
    window.constructor.api.ui.inventoryToggleVisibility(true);
    window.constructor.api.ui.inventorySelectTab('gsl');
    this.codeEditor.ace.editor.focus();
  }

  componentDidMount() {
    this.refreshDownloadMenu();
    if (gslState.hasOwnProperty('isConsoleOpen'))
          this.props.onToggleConsoleVisibility(gslState.isConsoleOpen);
    if (gslState.hasOwnProperty('editorContent') && this.state.editorContent !== gslState.editorContent) {
      this.onEditorContentChange(gslState.editorContent);
      this.onResultContentChange(gslState.resultContent);
      this.onStatusMessageChange(gslState.statusContent);
    }

    if (!gslState.hasOwnProperty('action'))
      gslState.actions = {};
    gslState.actions.runCode = this.runCode;

    // Run on Command-Enter
    this.codeEditor.ace.editor.commands.addCommand({
      name: 'gslrun',
      bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
      exec: function(editor) {
        gslState.actions.runCode();
      },
      readOnly: true
    });
  }

  // Toggles comments
  toggleComment = () => {
    const uncomment = function(ace, token, pattern, row) {
      const column = token.value.indexOf(pattern) + token.start;
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
    hyperlink.href = '/extensions/api/gslEditor/download?projectId=' +
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
      'gsl': 'GSL source code',
      'ape': 'ApE output zip file',
      'cm': 'Clone Manager output zip file',
      'allFormats': 'files'
    }
    const buttonType = evt.nativeEvent.button;

    for (const key of Object.keys(fileMap)) {
      if (evt.currentTarget.id.indexOf(key) !== -1) {
          // Save file first if required, if the gsl file is requested.
        if ((key === 'gsl' || key === 'allFormats') && (!this.state.toolbarItems[1].disabled)) {
          // save the GSL file first before downloading.
          window.constructor.extensions.files.write(
            window.constructor.api.projects.projectGetCurrentId(),
            extensionConfig.name,
            'project.gsl',
            gslState.editorContent,
          )
          .then(() => {   // refactor this to separate the save part.
            console.log('Saved GSL Code.');
            gslState.refreshDownloadList = true;
                        setTimeout(() => {
              this.onStatusMessageChange('');
            }, 2000);
            this.onStatusMessageChange('Preparing to download the ' + fileMap[key] + ' associated with this project...');
            this.downloadFileByType(key, buttonType);
            })
          .catch((err) => {
            console.log('Failed to save GSL Code');
            console.log(err);
          });
        } else {
          setTimeout(() => {
            this.onStatusMessageChange('');
          }, 2000);
          this.onStatusMessageChange('Preparing to download the ' + fileMap[key] + ' associated with this project...');
          this.downloadFileByType(key, buttonType);
        }
      }
    }
    this.codeEditor.ace.editor.focus();
  }

  render() {
    if (gslState.refreshDownloadList) {
      this.refreshDownloadMenu();
      gslState.refreshDownloadList = false;
    }
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
