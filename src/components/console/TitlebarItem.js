import React, { PropTypes, Component } from 'react';

/**
 * TitlebarItem represents a single clickable item on the Titlebar.
 *
 * Properties:
 *
 * {string} label - Display text representing the name of the item.
 * {string} imageUrl - A path representing a url of the image icon.
 * {function} action - A function to call when the item is clicked.
 */
export default class TitlebarItem extends Component {

  static propTypes = {
    label: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    action: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className={this.props.label.trim() !== '' ? 'TitleBarItem ButtonStyle' : 'TitleBarItem' }
        style={{backgroundImage: `url(${this.props.imageUrl})`}}
        onClick = {this.props.action}>
        <span>{this.props.label}</span>
      </div>
    );
  }
}
