import React, { Component, PropTypes } from 'react';

export default class ResultViewer extends Component {
  static propTypes = {
    resultContent: PropTypes.string,
  };

  static defaultProps = {
    resultContent: '',
  };

  render() {

    return (
      <div className="ResultViewer active">
         <div className="divResult">
         {this.props.resultContent}
         </div>
      </div>
    );
  }
}