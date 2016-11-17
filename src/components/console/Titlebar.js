import React, { PropTypes, Component } from 'react';
import TitlebarItem from './TitlebarItem';

/**
 * Titlebar represents the title bar of the output console window.
 *
 * Properties:
 *
 * {array} items - An array of TitlebarItems.
 */
export default class Titlebar extends Component {

  static propTypes = {
    items: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        label: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        action: PropTypes.func.isRequired,
        enabled: PropTypes.bool,
      })
    ),
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Titlebar">
        <div className="TitlebarText">
          GSL console
        </div>
        <div className="TitlebarItems">
          {this.props.items.map((item, i) => {
            return (<TitlebarItem
              key={i}
              label={item.label}
              action={item.action}
              imageUrl={item.imageUrl}
            />);
          })}
        </div>
      </div>
    );
  }
}
