import React from 'react';
import ReactDOM from 'react-dom';

export default class Frame extends React.Component {
  handleResizeStart(e) {
    e.preventDefault();
    let el = ReactDOM.findDOMNode(this);
    let param = this.props.width ? el.clientWidth : el.clientHeight;
    let posProp = this.props.width ? 'pageX' : 'pageY';
    let pos = e[posProp];
    let handleResize = (e) => {
      let newParam = param + (e[posProp] - pos);
      if (newParam < 5) newParam = 5;
      el.style[this.props.width ? 'width' : 'height'] = `${newParam}px`;
    };
    let handleResizeStop = () => {
      document.removeEventListener('mouseup', handleResizeStop);
      document.removeEventListener('mousemove', handleResize);
    };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeStop);
  }

  render() {
    let style = { position: 'relative' };
    if (this.props.height === 'auto' || this.props.width === 'auto') {
      style.flex = 1;
    }
    else if (this.props.width) {
      style.width = `${this.props.width}px`;
    }
    else if (this.props.height) {
      style.height = `${this.props.height}px`;
    }
    if (this.props.resizable) {
      let style = {
        position: 'absolute',
      };
      if (this.props.width) {
        Object.assign(style, {
          right: '0',
          top: '0',
          width: '5px',
          height: '100%',
          cursor: 'col-resize',
        });
      }
      else {
        Object.assign(style, {
          left: '0',
          bottom: '0',
          width: '100%',
          height: '5px',
          cursor: 'row-resize',
        });
      }
      this.resizeBar = <div style={style} onMouseDown={this.handleResizeStart.bind(this)} />;
    }
    return <div style={style} className={this.props.className}>
      {this.props.children}
      {this.resizeBar}
    </div>;
  }
}
