import React, { useState } from "react";
import classNames from "classnames";
import { remote } from "electron";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly queries: QueryType[];
  readonly selectedQueryId: number | null;
  readonly onAddQuery: () => void;
  readonly onSelectQuery: (query: QueryType) => void;
  readonly onDuplicateQuery: (query: QueryType) => void;
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

  const handleContextMenu = (query: QueryType): void => {
    onSelectQuery(query);
    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Duplicate",
          click: (): void => {
            onDuplicateQuery(query);
          },
        },
        {
          label: "Delete",
          click: (): void => {
            if (window.confirm("Are you sure?")) {
              onDeleteQuery(query.id);
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

  console.log(queries);

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
            onClick={(): void => handleClickItem(query)}
            onContextMenu={(): void => handleContextMenu(query)}
          >
            {query.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueryList;
