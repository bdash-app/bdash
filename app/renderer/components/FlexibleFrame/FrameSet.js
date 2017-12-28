import React from 'react';

export default class FrameSet extends React.Component {
  render() {
    let style = {
      display: 'flex',
      flexDirection: this.props.direction,
      position: 'relative',
    };
    if (this.props.height === 'auto' || this.props.width === 'auto') {
      style.flex = 1;
    }
    else if (this.props.width) {
      style.width = `${this.props.width}px`;
    }
    else if (this.props.height) {
      style.height = `${this.props.height}px`;
    }
    return <div style={style} className={this.props.className}>
      {this.props.children}
    </div>;
  }
}
