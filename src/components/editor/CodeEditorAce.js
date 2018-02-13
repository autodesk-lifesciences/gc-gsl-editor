import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import '../../behavior/editor/brace/mode/gsl';
import '../../behavior/editor/brace/theme/xcode';
import '../../behavior/editor/brace/ext/language_tools';
import 'brace/ext/searchbox';
//import '../../behavior/editor/brace/snippets/javascript';
import '../../behavior/editor/brace/snippets/gsl';
const autocompleteList = require('../../behavior/editor/autocomplete');

/**
 * CodeEditorAce represents the GSL Ace editor.
 *
 * Properties:
 *
 * {function} callbackParent - A function to call when editor content changes.
 * {string} value - The editor content when set externally.
 */
export default class CodeEditorAce extends Component {
  static propTypes = {
    callbackParent: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
  };

  static defaultProps = {
    value: '',
  };

  state = {
    editorHeight: 200,
  };

  componentDidMount() {
    this.ace.editor.completers.push({
      getCompletions: (editor, session, pos, prefix, callback) => {
         // callback(null, autocompleteList.geneList);
      },
      getDocTooltip: (item) => {
        if (autocompleteList.geneDocStrings[item.value]) {
          item.docHTML = autocompleteList.geneDocStrings[item.value];
        }
      },
    });

    const resizeListener = (evt) => {
      this.setState({editorHeight: this.getEditorHeight() });
    };
    window.addEventListener('resize', resizeListener);
    this.dispose = () => {
      window.removeEventListener('resize', resizeListener);
    };
    this.setState({editorHeight: this.getEditorHeight() }); /* eslint react/no-did-mount-set-state: 0 */
    this.ace.editor.focus();
  }

  componentWillUnmount() {
    this.dispose();
  }

  getEditorHeight = () => {
    //return this.element.getBoundingClientRect().height;
    let editorHeight = 0;
    if (document.querySelector('.GSLEditorLayout') !== null && document.querySelector('.ConsoleLayout') !== null) {
      editorHeight = document.querySelector('.GSLEditorLayout').getBoundingClientRect().height - document.querySelector('.ConsoleLayout').getBoundingClientRect().height - 35;
    }
    return editorHeight;
  }

  // This editor seems to be returning the content of the editor rather than the event
  handleChange = (evt) => {
    this.props.callbackParent(evt);
  };

  render() {
    return (
      <div
        className="Editor bro"
        ref={
          (el) => {
            if (el) {
              this.element = el;
            }
          }
        }
      >
        <AceEditor
          ref={
            (el) => {
              if (el) {
                this.ace = el;
              }
            }
          }
          mode="gsl"
          theme="xcode"
          name="aceEditor"
          editorProps={{ $blockScrolling: Infinity }}
          setOptions={{ dragEnabled: true, enableSnippets: true }}
          enableBasicAutocompletion={Boolean(true)}
          enableSnippets={Boolean(true)}
          enableLiveAutocompletion={Boolean(true)}
          height={`${this.state.editorHeight}px`}
          width="100%"
          showPrintMargin={false}
          value={this.props.value}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

