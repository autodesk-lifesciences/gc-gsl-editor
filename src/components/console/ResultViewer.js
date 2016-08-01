import React, { Component, PropTypes } from 'react';

export default class ResultViewer extends Component {
  static propTypes = {
    resultContent: PropTypes.string,
    isVisible: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    resultContent: '',
  };

  setResults = (data) => {
    console.log('setting!');
    console.log(data);
  };

  render() {
    const textResultStyle = {
      width: '100%',
      display: 'inline-block',
    };


    return (
      <div className="ResultViewer">
         <pre className="preResult">
         {this.props.resultContent}
         </pre>
      </div>
    );
  }
}