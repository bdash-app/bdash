import * as React from 'react';
import LoadingIcon from '../LoadingIcon';

export default class ProgressIcon extends React.Component<any, any> {
  renderIcon() {
    switch (this.props.status) {
      case 'working': return <LoadingIcon />;
      case 'success': return <i className="fa fa-check" />;
      case 'failure': return <i className="fa fa-close" />;
      default: throw new Error(`${this.props.status} is invalid status`);
    }
  }

  renderMessage() {
    if (!this.props.message) return null;

    return <span className="ProgressIcon-message">{this.props.message}</span>;
  }

  render() {
    return <span className={`ProgressIcon is-${this.props.status}`}>
      <span className="ProgressIcon-icon">{this.renderIcon()}</span>
      {this.renderMessage()}
    </span>;
  }
}
