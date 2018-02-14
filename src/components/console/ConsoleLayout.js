import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import ResultViewer from './ResultViewer';
import Titlebar from './Titlebar';

/**
 * ConsoleLayout groups together the components in the console window.
 *
 * Properties:
 *
 * {function} resultChange - Result/Output text from running the GSL code.
 * {string} resultContent - A function to be called when the result changes.
 * {bool} isOpen - True, if the output console is open.
 * {function} onToggleConsoleVisibility - A function to be called when the console visibility is toggled.
 */
export default class ConsoleLayout extends Component {

  static propTypes = {
    resultChange: PropTypes.func,
    resultContent: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onToggleConsoleVisibility: PropTypes.func,
  };

  static defaultProps = {
    resultContent: '',
    isOpen: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      openHeight: 150,
      titlebarItems: [
        {
          label: 'Clear',
          action: this.clearConsole,
          enabled: true,
        },
        {
          label: '  ',
          action: this.closeConsole,
          enabled: true,
          imageUrl: '/images/ui/close_icon.svg',
        },
      ],
    };
  }

  componentDidUpdate() {
    // Note: This is necessary for the ace_content size to update.
    window.dispatchEvent(new Event('resize'));
  }

  throttledDispatchResize = throttle(() => window.dispatchEvent(new Event('resize')), 50);

  /**
   * Handles the resize bar on the console.
   */
  handleResizableMouseDown = evt => {
    evt.preventDefault();
    this.refs.resizeHandle.classList.add('dragging');
    document.addEventListener('mousemove', this.handleResizeMouseMove);
    document.addEventListener('mouseup', this.handleResizeMouseUp);
    this.dragStart = evt.pageY;
    this.dragMax = document.querySelector('.GSLEditorLayout').getBoundingClientRect().height - 100;
    this.openStart = this.state.openHeight;
  };

  handleResizeMouseMove = evt => {
    evt.preventDefault();
    const delta = this.dragStart - evt.pageY;
    const minHeight = 70;
    const nextHeight = Math.min(this.dragMax, Math.max(minHeight, this.openStart + delta));
    this.setState({ openHeight: nextHeight });
    this.throttledDispatchResize();
  };

  handleResizeMouseUp = evt => {
    evt.preventDefault();
    this.refs.resizeHandle.classList.remove('dragging');
    this.dragStart = null;
    this.openStart = null;
    document.removeEventListener('mousemove', this.handleResizeMouseMove);
    document.removeEventListener('mouseup', this.handleResizeMouseUp);
    window.dispatchEvent(new Event('resize'));
  };

  /**
   * Hides the console.
   */
  closeConsole = () => {
    this.props.onToggleConsoleVisibility(false);
  }

  /**
   * Clears the console.
   */
  clearConsole = () => {
    this.props.resultChange('');
  }

  render() {
    return (
      <div className="ConsoleLayout bro" style={{height: this.props.isOpen ? this.state.openHeight : 0 }}>
        <div ref="resizeHandle"
          className="ConsoleLayout-resizeHandle"
          onMouseDown={this.handleResizableMouseDown}></div>
        <Titlebar items={this.state.titlebarItems} />
        <ResultViewer resultContent={this.props.resultContent}/>
      </div>
    );
  }
}
