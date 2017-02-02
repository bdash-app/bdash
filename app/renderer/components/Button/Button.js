import React from 'react';

export default class Button extends React.Component {
  handleClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    return <span className="Button" onClick={this.handleClick.bind(this)}>{this.props.children}</span>;
  }
}
