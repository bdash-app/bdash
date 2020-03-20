import React from "react";
import classNames from "classnames";

type Props = {
  readonly onSelect: (page: string) => void;
  readonly selectedPage: string;
};

export default class GlobalMenu extends React.Component<Props> {
  get menuList(): React.ReactNode {
    return [
      { page: "query", icon: "terminal" },
      { page: "dataSource", icon: "database" },
      { page: "setting", icon: "cog" }
    ].map((item, idx) => {
      const selected = this.props.selectedPage === item.page;
      const className = classNames("GlobalMenu-item", `GlobalMenu-${item.page}`, {
        "is-selected": selected
      });

      return (
        <span className={className} onClick={(): void => this.handleClick(item.page)} key={idx}>
          <i className={`fas fa-${item.icon}`} />
        </span>
      );
    });
  }

  handleClick(page: string): void {
    this.props.onSelect(page);
  }

  render(): React.ReactNode {
    return <div className={classNames("GlobalMenu", { darwin: process.platform === "darwin" })}>{this.menuList}</div>;
  }
}
