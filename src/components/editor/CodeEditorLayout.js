import React, { Component } from 'react';
import PropTypes from 'prop-types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import sanitize from 'sanitize-filename';

import CodeEditorAce from './CodeEditorAce';
import Toolbar from './Toolbar';
import * as compiler from '../../behavior/compiler/client';
import * as canvas from '../../behavior/canvas/output';
import { toggleComments } from '../../behavior/editor/comments';
import { registerKeysRunCode } from '../../behavior/editor/keyBindings';

const config = require('../../behavior/compiler/config.json');
const gslState = require('../../globals');//I don't understand this at all.

require('../../styles/styles.css');
/**
 * CodeEditorLayout groups together the components of the editor.
 *
 * Properties:
 *
 * {function} onEditorContentChange - A function to call when editor content changes.
 * {function} onSubmit - A function to call when the code execution results change.
 * {function} onToggleConsoleVisibility - A function to call when visibility of the output console is toggled.
 * {function} onStatusContentChange - A function to call when the editor's status bar content changes.
 * {bool} isConsoleOpen - True, if the output console is open.
 */
export default class CodeEditorLayout extends Component {
  static propTypes = {
    onEditorContentChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onToggleConsoleVisibility: PropTypes.func.isRequired,
    onStatusContentChange: PropTypes.func.isRequired,
    isConsoleOpen: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      editorDirty: false, // NB - this is state local to this component, not gslState
      editorContent: '',
      resultTerminalOutput: '',
      resultsFiles: {},
      statusMessage: 'Begin typing GSL code.',
      currentMenuPosition: {},
      consoleVisible: true,
      toolbarItems: [
        {
          label: 'Run',
          action: this.runCode,
          imageUrl: '/images/ui/run_icon.svg',
        },
        {
          label: 'Show Console',
          action: this.showConsole,
        },
        {
          label: 'Comment',
          action: this.toggleComment,
        },
        {
          label: 'Download',
          action: this.showDownloadMenu,
          imageUrl: '/images/ui/download_icon.svg',
        },
      ],
    };
  }

  /**
   * Actions to be performed when this component mounts.
   */
  componentDidMount() {
    this._isMounted = true;
    this.refreshDownloadMenu();
    if (gslState.hasOwnProperty('isConsoleOpen')) {
      this.props.onToggleConsoleVisibility(gslState.isConsoleOpen);
    }
    registerKeysRunCode(this.codeEditor.ace, this.runCode);

    //This is a hack, because the project id is retrieved from the
    //window object, and it could change at any moment, out of the react
    //lifecycle events. For example, when componentWillUnmount is called,
    //the projectId can be different (if the unmount was triggered by a
    //project change).
    //Nevertheless, the hack works.
    const projectId = this.getProjectId();
    this.projectId = projectId;

    //if project already loaded, just set as editor content
    if (gslState[projectId] && gslState[projectId].savedCode) {
      gslState.editorContent = gslState[projectId].savedCode;
      this.refreshEditorFromState();
    } else {
      //otherwise, load project and try to load settings
      this.codeEditor.ace.editor.env.editor.setReadOnly(true);

      compiler.loadProjectCode(projectId)
        .catch(() => {
          return compiler.loadDefaults(projectId);
        })
        .then(() => {
          this.refreshEditorFromState();
        });
    }

    const timerId = setInterval(() => {
      const code = gslState.editorContent;
      if (projectId && code) {
        compiler.saveProjectCode(projectId, code);
      }
    }, 30000);//Autosave every 30 seconds
    this.dispose = () => {
      clearInterval(timerId);
    };
  }

  /**
   * Actions to be performed when this component unmounts.
   */
  componentWillUnmount() {
    const code = gslState.editorContent;
    if (this.projectId && code) {
      compiler.saveProjectCode(this.projectId, code);
    }
    this.projectId = null;
    this.dispose();
    this._isMounted = false;
  }

  /**
   * Actions to be performed when the editor content changes
   * @param {string} content
   */
  onEditorContentChange = (content) => {
    const projectId = this.getProjectId();
    const savedCode = (gslState && gslState[projectId]) ? gslState[projectId].savedCode : null;
    const editorDirty = content !== savedCode;
    this.setState({
      editorContent: content,
      editorDirty,
    });

    this.props.onEditorContentChange(content);
  };

  /**
   * Actions to be performed when the status message changes
   * @param {string} message
   */
  onStatusMessageChange = (message) => {
    this._isMounted && this.setState({ statusMessage: message });
    this.props.onStatusContentChange(message);
    window.constructor.api.ui.uiSetGrunt(message);
  };

  /**
   * Actions to be performed when the result of the code execution changes
   * @param {string} content
   */
  onResultContentChange = (stdErrOut, fileObject) => {
    this._isMounted && this.setState({ resultTerminalOutput: stdErrOut });
    this.props.onSubmit(stdErrOut);
  };

  /**
   * update state of download menu items
   * @param settings
   */
  onDownloadMenuSettingsChange = (files) => {
    let isSomethingToDownload = false;
    this.downloadMenuItems.forEach(item => {
      // special case gsl
      if (item.type === 'gsl' && this.state.editorContent !== '') {
        item.disabled = false;
        isSomethingToDownload = true;
      } else {
        item.disabled = !Object.keys(files).find((fileName) => {
          return fileName.endsWith(item.type);
        });
        if (!item.disabled) {
          isSomethingToDownload = true;
        }
      }
    });
    this.downloadMenuItems.forEach((downloadItem) => {
      if (downloadItem.type === 'allFormats' && isSomethingToDownload) {
        downloadItem.disabled = false;
      }
    });
  };

  getProjectId() {
    return window.constructor.api.projects.projectGetCurrentId();
  }

  getProjectName() {
    const projectId = this.getProjectId();
    return sanitize(window.constructor.api.projects.projectGetName(projectId));
  }

  /**
   * actions to be performed when the editor content changes
   * @param {string} content
   */
  refreshDownloadMenu = () => {
    const projectId = this.getProjectId();
    const files = (gslState[projectId] && gslState[projectId].outputs) || {};
    this.onDownloadMenuSettingsChange(files);
  };

  /**
   * reload editor content from saved global state (cache)
   * @param {string} content
   */
  refreshEditorFromState = () => {
    this.onEditorContentChange(gslState.editorContent);
    this.onResultContentChange(gslState.resultTerminalOutput);
    this.codeEditor.ace.editor.env.editor.setReadOnly(false);
  };

  /**
   * Toggles comments in the editor.
   */
  toggleComment = () => {
    toggleComments(this.codeEditor.ace);
  };

  /**
   * Expands the console window.
   */
  showConsole = () => {
    this.setState({ consoleVisible: true });
    this.props.onToggleConsoleVisibility(this.state.consoleVisible);
    gslState.isConsoleOpen = true;
    window.dispatchEvent(new Event('resize'));
    this.codeEditor.ace.editor.focus();
  };

  /**
   * Runs GSL code present in the editor
   */
  runCode = () => {
    const projectId = this.getProjectId();
    const code = this.state.editorContent;

    // DA: WTF: why save and not wait if it's not important??????!!!!???
    // save the code, but no need to wait for it to resolve before running remotely
    // note - this will save code even if it running GSL failed
    compiler.saveProjectCode(projectId, code)
      .then(() => this.setState({ editorDirty: false }));

    this.onStatusMessageChange('Running code...');
    // console.log(`Sending code to the server: ${code}`);
    compiler.run(code, config.arguments, this.getProjectId())
      .then((data) => {
        const results = data.result;
        if (results) {

          //Add the project name to the output files
          let projectName = this.getProjectName() || 'gslOut';
          if (projectName && results.outputs) {
            projectName = projectName.replace(' ', '');
            const outputFileNames = Object.keys(results.outputs);
            outputFileNames.forEach((outputName) => {
              let val = results.outputs[outputName];
              delete results.outputs[outputName];
              let newOutputName = outputName.replace('gslOut', projectName);
              if (newOutputName.endsWith('primers.txt')) {
                newOutputName = newOutputName.replace('primers.txt', 'primers.csv');
                //Make actual comma separated so you can just double
                //click the file to open in Excel etc.
                val = val.replace(/ /g, ',');
                val = val.replace(/\t/g, ',');
              }
              results.outputs[newOutputName] = val;
            });
          }

          gslState[projectId] = results;
          this.onResultContentChange(results.stdout.join('') + results.stderr.join(''), results.outputs);
          if (results.exitCode === 0) {
            this.onStatusMessageChange('GSL executed successfully.');

            canvas.render(projectId, JSON.parse(results.outputs[`${projectName}.json`]));
            this.refreshDownloadMenu();

          //TODO: When the primers feature has been re-enabled by Darren, we
          //can address this
          // } else if (compiler.isPrimerFailure(data.result)) {
          //   this.onStatusMessageChange('Re-running the code without primers...');
          //   this.rerunCode(code, compiler.removePrimerThumperArgs(config.arguments));
          } else {
            this.onStatusMessageChange('Running this code resulted in errors. Please check the console for details.');
            this.showConsole();
          }
        } else {
          console.error(data);
          this.onStatusMessageChange('Running this code resulted in errors. Please check the console for details.');
        }
      });
  };

  /**
   * Runs GSL code present in the editor
   * @param {string} code
   * @param newArgs Args to run with
   */
  rerunCode = (code, newArgs) => {
    console.log(`Sending code to the server: ${code}`);
    const projectId = this.getProjectId();
    compiler.run(code, newArgs, projectId)
      .then((data) => {
        // retain the previous console error.
        const appendedResultOutput = this.state.resultTerminalOutput + '\nResult on rerun without primers:\n' + data.result;
        this.onResultContentChange(appendedResultOutput);
        if (data.status === 0) {
          console.log('data', data);
          this.onStatusMessageChange('GSL executed successfully.');
          canvas.render(projectId, JSON.parse(data.contents));
          this.refreshDownloadMenu();
        } else {
          this.onStatusMessageChange('Running this code resulted in errors. Please check the console for details.');
          this.showConsole();
        }
      });
  };

  downloadMenuItems = [
    {
      key: 'download-gsl-file',
      type: 'gsl',
      text: 'Source GSL',
      disabled: false,
      action: () => {
        this.doDownload('gsl');
      },
    },
    {},
    {
      key: 'download-ape-zip-file',
      type: 'ape',
      text: 'Output as ApE file archive',
      disabled: false,
      action: () => {
        this.doDownload('ape');
      },
    },
    {
      key: 'download-cm-zip-file',
      type: 'cm',
      text: 'Output as Clone Manager file achive',
      disabled: false,
      action: () => {
        this.doDownload('cm');
      },
    },
    {},
    {
      key: 'download-allFormats-zip-file',
      type: 'allFormats',
      text: 'All formats',
      disabled: false,
      action: () => {
        this.doDownload('allFormats');
      },
    },
  ];

  /**
   * Opens the download menu.
   * @param {MouseEvent} click event
   */
  showDownloadMenu = (evt) => {
    const showMenu = window.constructor.api.ui.uiShowMenu;
    showMenu(this.downloadMenuItems, {
      x: evt.pageX,
      y: evt.pageY,
    }, true);
  };

  /**
   * Downloads a file based on its type.
   * @param {string} The type of file as specified in downloadMenuItems
   */
  downloadFileByType = (fileType) => {
    const projectId = this.getProjectId();
    const zip = new JSZip();
    const files = (gslState[projectId] && gslState[projectId].outputs) || {};
    const fileName = Object.keys(files).find((f) => {
      return f.endsWith(fileType);
    });
    let zipFileName;
    if (fileType === 'gsl') {
      zip.file('project.gsl', gslState.editorContent);
      zipFileName = 'project.gsl.zip';
    } else if (fileType === 'allFormats') {
      zip.file('project.gsl', gslState.editorContent);
      Object.keys(files).forEach((f) => {
        zip.file(f, files[f]);
      });
      zipFileName = 'project.zip';
    } else {
      if (files[fileName]) {
        zip.file(fileName, files[fileName]);
        zipFileName = `${fileName}.zip`;
      }
    }
    if (zipFileName) {
      zip.generateAsync({ type: 'blob' })
        .then((content) => {
          saveAs(content, zipFileName, 'application/octet-stream');
        });
    }
  }

  /**
   * Download a file depending on the item clicked
   * @param {MouseEvent} click event
   */
  doDownload(key) {
    const fileMap = {
      'gsl': 'GSL source code',
      'ape': 'ApE output zip file',
      'cm': 'Clone Manager output zip file',
      'allFormats': 'files',
    };

    const projectId = this.getProjectId();
    const code = gslState.editorContent;
    const editorIsDirty = this.state.editorDirty;

    this.onStatusMessageChange(`Preparing data for ${fileMap[key]}. Download will begin automatically when complete.`);

    //want to save both the project file and the remote files before downloading
    const writeFilesPromise = (editorIsDirty) ?
      compiler.saveProjectCode(projectId, code)
        .then(() => {
          console.log('Saved GSL Code.');
          Object.assign(gslState, { refreshDownloadList: true });
        }) :
      Promise.resolve(null);

    writeFilesPromise
      .catch((err) => {
        console.log('Failed to save GSL Code');
        console.log(err);
        this.onStatusMessageChange('There was an error saving the GSL code. Please try again.');
        return Promise.reject();
      })
      .then(() => this.downloadFileByType(key));

    this.codeEditor.ace.editor.focus();
  }

  render() {
    if (gslState.refreshDownloadList) {
      this.refreshDownloadMenu();
      gslState.refreshDownloadList = false;
    }

    return (
      <div className="CodeEditorLayout">
        <Toolbar toolbarItems={this.state.toolbarItems}/>
        <CodeEditorAce
          ref={(el) => {
            if (el) {
              this.codeEditor = el;
            }
          }}
          callbackParent={this.onEditorContentChange}
          value={this.state.editorContent}
        />
      </div>
    );
  }
}
