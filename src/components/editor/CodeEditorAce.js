import React, {Component, PropTypes} from 'react';
import AceEditor from 'react-ace';
var autocompleteList = require('../../behavior/editor/autocomplete');
import * as dragDropOperator from '../../behavior/editor/dragDrop';
import '../../behavior/editor/brace/mode/gsl';
import '../../behavior/editor/brace/theme/xcode';
import '../../behavior/editor/brace/ext/language_tools';

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
    //todo - unmount this - see if there is a dispose() funciton, ask duncan
    window.constructor.DnD.registerTarget(this.element, {
      drop: this.onDrop.bind(this),
      zorder: 1000,
    });

    this.ace.editor.completers.push({
      getCompletions: function(editor, session, pos, prefix, callback) {
         // callback(null, autocompleteList.geneList);
      },
      getDocTooltip: function(item) {
        if (autocompleteList.geneDocStrings[item.value]) {
          item.docHTML = '<textarea rows=4 cols=40 enabled=false>' + autocompleteList.geneDocStrings[item.value] + '</textarea>';
        }
      },
    });

    this.listener = window.addEventListener('resize', (evt) => {
      this.setState({editorHeight: this.getEditorHeight() });
    });
    this.setState({editorHeight: this.getEditorHeight() });
    this.ace.editor.focus();
  }

  componentWillUnmount() {
    this.listener();
  }

  getEditorHeight = () => {
    //return this.element.getBoundingClientRect().height;
    let editorHeight = 0;
    this.ace.editor.focus();
    if (document.querySelector('.GSLEditorLayout') !== null && document.querySelector('.ConsoleLayout') !== null)
      editorHeight = document.querySelector('.GSLEditorLayout').getBoundingClientRect().height - document.querySelector('.ConsoleLayout').getBoundingClientRect().height - 60;
    return editorHeight;
  }

  // This editor seems to be returning the content of the editor rather than the event
  handleChange = (e) => {
    this.props.callbackParent(e);
  };

  // Trigger drag and drop behavior when an operator is dropped on the editor
  onDrop = (position, payload, evt) => {
    if (payload.type === 'GSL') {
      dragDropOperator.insert(this.ace, position, payload, evt);
    }
  };


  render() {
    return (
        <div className="Editor" ref={(el) => {
            if (el) {
              this.element = el;
            }
          }}>
          <AceEditor ref={(el) => {
            if (el) {
              this.ace = el;
            }
          }}
             mode="gsl"
             theme="xcode"
             name="aceEditor"
             editorProps={{ $blockScrolling: Infinity}}
             setOptions={{dragEnabled: true}}
             enableBasicAutocompletion={true}
             enableSnippets={true}
             enableLiveAutocompletion={true}
             width="Infinity"
             height={this.state.editorHeight + 'px'}
             showPrintMargin={false}
             value={this.props.value}
             onChange={this.handleChange}/>
        </div>
    );
  }
}

