import React, { PropTypes, Component } from 'react';
import ResultViewer from './ResultViewer';
import Titlebar from './Titlebar';

export default class ConsoleLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  static propTypes = {
    resultChange: PropTypes.func,
    resultContent: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    resultContent: '',
    isOpen: false,
  }

  setIsOpen = (value) => {
    this.setState( { isOpen: value });  
  }

  render() {

    return (
      <div className="ConsoleLayout">
        <Titlebar isVisible={this.state.isOpen} resultChange={this.props.resultChange}/>
        <ResultViewer isVisible={this.state.isOpen} resultContent={this.props.resultContent}/>
      </div>
      );
  }

}