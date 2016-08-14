import React, { PropTypes, Component } from 'react';
import throttle  from 'lodash.throttle';

import ResultViewer from './ResultViewer';
import Titlebar from './Titlebar';

export default class ConsoleLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openHeight: 150,
    };
  }

  static propTypes = {
    resultChange: PropTypes.func,
    resultContent: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onToggleConsoleVisibility: PropTypes.func,
  }

  static defaultProps = {
    resultContent: '',
    isOpen: true,
  }


  throttledDispatchResize = throttle(() => window.dispatchEvent(new Event('resize')), 50);

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

  closeConsole = () => {
    this.props.onToggleConsoleVisibility(false);
  }

  componentDidUpdate() {
    // Necessary for the ace_content size to update.
    window.dispatchEvent(new Event('resize'));
  }

  titlebarItems = () => {
    return [
      {
        label: 'Clear Console',
        action: this.props.resultChange.bind(this, ''),
        enabled: true,
      },
      {
        label: '  ',
        action: this.closeConsole,
        enabled: true,
        imageUrl: '/images/ui/close_icon.svg'
      },
    ];
  };

  render() {

    return (
      <div className="ConsoleLayout" style={{height: this.props.isOpen ? this.state.openHeight : 0 }}>
        <div ref="resizeHandle"
             className="ConsoleLayout-resizeHandle"
             onMouseDown={this.handleResizableMouseDown}></div>
        <Titlebar items={this.titlebarItems()} />
        <ResultViewer resultContent={this.props.resultContent}/>
      </div>
      );
  }
}