import React from 'react';

export default class Button extends React.Component {
  handleClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    let className = `${this.props.className || ''} Button`.trim();
    return <span className={className} onClick={this.handleClick.bind(this)}>{this.props.children}</span>;
  }
}
