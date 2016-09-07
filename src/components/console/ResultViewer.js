import React, { Component, PropTypes } from 'react';

/**
 * ResultViewer represents the container holding the output results.
 *
 * Properties:
 *
 * {string} resultContent - Result/Output text after running GSL code.
 */
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
