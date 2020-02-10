import React from "react";
import classNames from "classnames";

export default class GlobalMenu extends React.Component<any, any> {
  get menuList() {
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
        <span className={className} onClick={() => this.handleClick(item.page)} key={idx}>
          <i className={`fas fa-${item.icon}`} />
        </span>
      );
    });
  }

  handleClick(page) {
    this.props.onSelect(page);
  }

  render() {
    return <div className="GlobalMenu">{this.menuList}</div>;
  }
}
