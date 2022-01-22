import React from "react";
import LoadingIcon from "../LoadingIcon";

type Props = {
  readonly status: string | null;
  readonly message?: string | null;
};

export default class ProgressIcon extends React.Component<Props> {
  renderIcon(): React.ReactNode {
    switch (this.props.status) {
      case "working":
        return <LoadingIcon />;
      case "success":
        return <i className="fas fa-check" />;
      case "failure":
        return <i className="fas fa-times" />;
      default:
        throw new Error(`${this.props.status} is invalid status`);
    }
  }

  renderMessage(): React.ReactNode {
    if (!this.props.message) return null;

    return <span className="ProgressIcon-message">{this.props.message}</span>;
  }

  override render(): React.ReactNode {
    return (
      <span className={`ProgressIcon is-${this.props.status}`}>
        <span className="ProgressIcon-icon">{this.renderIcon()}</span>
        {this.renderMessage()}
      </span>
    );
  }
}
