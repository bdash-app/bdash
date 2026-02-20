import React, { useState, MouseEvent } from "react";
import classNames from "classnames";
import { QueryType } from "../../../lib/Database/Query";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";

const MENU_ID = "QUERY_LIST_MENU";

type Props = {
  readonly queries: QueryType[];
  readonly selectedQueryId: number | null;
  readonly onAddQuery: () => void;
  readonly onRefresh: () => void;
  readonly onSelectQuery: (queryId: number) => void;
  readonly onDuplicateQuery: (queryId: number) => void;
  readonly onDeleteQuery: (queryId: number) => void;
};

const QueryList: React.FC<Props> = ({
  queries,
  selectedQueryId,
  onAddQuery,
  onRefresh,
  onSelectQuery,
  onDuplicateQuery,
  onDeleteQuery,
}) => {
  const handleClickNew = onAddQuery;
  const handleClickRefresh = onRefresh;

  const handleClickItem = onSelectQuery;

  const handleDuplicate = () => {
    if (selectedQueryId === null) {
      return;
    }
    onDuplicateQuery(selectedQueryId);
  };

  const handleDelete = () => {
    if (selectedQueryId === null) {
      return;
    }
    if (window.confirm("Are you sure?")) {
      onDeleteQuery(selectedQueryId);
    }
  };

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleContextMenu = (event: MouseEvent, queryId: number): void => {
    show({
      event,
      props: {
        key: "value",
      },
    });

    onSelectQuery(queryId);
  };

  const [filterText, setFilterText] = useState("");
  const handleChange = (event) => {
    setFilterText(event.target.value);
  };

  const filteredQueries = queries.filter((item) => item.title.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div className="QueryList">
      <div className={classNames("QueryList-new", { darwin: process.platform === "darwin" })}>
        <div className="QueryList-controls">
          <i className="fas fa-plus" onClick={handleClickNew} title="New Query" />
          <i className="fas fa-sync-alt" onClick={handleClickRefresh} title="Reload query list" />
        </div>
        <div className="QueryList-filter">
          <i className="fas fa-search" />
          <input type="search" placeholder="Filter by title.." value={filterText} onChange={handleChange} />
        </div>
      </div>
      <Menu id={MENU_ID}>
        <Item onClick={handleDuplicate}>Duplicate</Item>
        <Item onClick={handleDelete}>Delete</Item>
      </Menu>
      <ul className="QueryList-list">
        {filteredQueries.map((query) => (
          <li
            key={query.id}
            className={selectedQueryId === query.id ? "is-selected" : ""}
            onClick={(): void => handleClickItem(query.id)}
            onContextMenu={(event): void => handleContextMenu(event, query.id)}
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
