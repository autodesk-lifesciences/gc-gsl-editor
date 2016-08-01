import React, {PropTypes, Component} from 'react';
import ToolbarItem from './ToolbarItem';


export default class Toolbar extends Component {
  static propTypes = {
    toolbarItems: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        label: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        action: PropTypes.func.isRequired,
        enabled: PropTypes.bool
      })
    )
  };

  constructor(props) {
    super(props);
  }

  render() {

    return (
        <div
          style={{
            height: '30px',
            width: '100%',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              width: '100%',
              height: '100%',
              borderStyle: 'none none solid none',
              borderWidth: '1',
              borderColor: '#dadbdf',
              textAlign: 'right',
              verticalAlign: 'top',
            }}
          >
            { this.props.toolbarItems.map(function(item, i){
                return <ToolbarItem
                  key={i}
                  label={item.label}
                  action={item.action}
                  imageUrl={item.imageUrl}
                  />;
            })}
          </div>
        </div>
    );
  }
}