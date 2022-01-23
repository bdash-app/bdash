import React from "react";

interface ButtonProps {
  readonly onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
  readonly className?: string;
}

export default class Button extends React.Component<ButtonProps> {
  handleClick(e: React.MouseEvent<HTMLSpanElement>): void {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  override render(): React.ReactNode {
    const className = `${this.props.className || ""} Button`.trim();
    return (
      <span className={className} onClick={this.handleClick.bind(this)}>
        {this.props.children}
      </span>
    );
  }
}
