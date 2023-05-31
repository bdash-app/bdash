import React, { useState } from "react";
import classNames from "classnames";
import { remote } from "electron";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly queries: QueryType[];
  readonly selectedQueryId: number | null;
  readonly onAddQuery: () => void;
  readonly onSelectQuery: (queryId: number) => void;
  readonly onDuplicateQuery: (queryId: number) => void;
  readonly onDeleteQuery: (queryId: number) => void;
};

const QueryList: React.FC<Props> = ({
  queries,
  selectedQueryId,
  onAddQuery,
  onSelectQuery,
  onDuplicateQuery,
  onDeleteQuery,
}) => {
  const handleClickNew = onAddQuery;

  const handleClickItem = onSelectQuery;

  const handleContextMenu = (queryId: number): void => {
    onSelectQuery(queryId);
    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Duplicate",
          click: (): void => {
            onDuplicateQuery(queryId);
          },
        },
        {
          label: "Delete",
          click: (): void => {
            if (window.confirm("Are you sure?")) {
              onDeleteQuery(queryId);
            }
          },
        },
      ]);
      menu.popup({ window: remote.getCurrentWindow() });
    });
  };

  const [filterText, setFilterText] = useState("");
  const handleChange = (event) => {
    setFilterText(event.target.value);
  };

  const filteredQueries = queries.filter((item) => item.title.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="QueryList">
      <div className={classNames("QueryList-new", { darwin: process.platform === "darwin" })}>
        <i className="fas fa-plus" onClick={handleClickNew} />
        <div className="QueryList-filter">
          <i className="fas fa-search" />
          <input type="search" placeholder="Filter by title.." value={filterText} onChange={handleChange} />
        </div>
      </div>
      <ul className="QueryList-list">
        {filteredQueries.map((query) => (
          <li
            key={query.id}
            className={selectedQueryId === query.id ? "is-selected" : ""}
            onClick={(): void => handleClickItem(query.id)}
            onContextMenu={(): void => handleContextMenu(query.id)}
          >
            <div className="QueryList-item">
              <div className="QueryList-item-title">{query.title}</div>
              <div className="QueryList-item-subtitle">{query.body.replace(/\s{2,}/g, " ").substring(0, 50)}</div>
              <div className="QueryList-item-time">{query.createdAt.format("YYYY-MM-DD")}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueryList;
