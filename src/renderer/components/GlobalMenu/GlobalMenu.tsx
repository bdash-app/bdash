import React from "react";
import classNames from "classnames";

type Props = {
  readonly onSelect: (page: string) => void;
  readonly selectedPage: string;
};

const GlobalMenu = React.memo<Props>(function GlobalMenu({ onSelect, selectedPage }) {
  const menuList = ((): React.ReactNode => {
    return [
      { page: "query", icon: "terminal" },
      { page: "dataSource", icon: "database" },
      { page: "setting", icon: "cog" },
    ].map((item, idx) => {
      const selected = selectedPage === item.page;
      const className = classNames("GlobalMenu-item", `GlobalMenu-${item.page}`, {
        "is-selected": selected,
      });

      return (
        <span className={className} onClick={(): void => handleClick(item.page)} key={idx}>
          <i className={`fas fa-${item.icon}`} />
        </span>
      );
    });
  })();

  const handleClick = onSelect;

  return <div className="GlobalMenu">{menuList}</div>;
});

export default GlobalMenu;
