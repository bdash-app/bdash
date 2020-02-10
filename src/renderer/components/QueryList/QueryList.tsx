import React from "react";
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

export default class QueryList extends React.Component<Props> {
  handleClickNew() {
    this.props.onAddQuery();
  }

  handleClickItem(query: QueryType) {
    this.props.onSelectQuery(query);
  }

  handleContextMenu(query: QueryType) {
    this.props.onSelectQuery(query);
    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Duplicate",
          click: () => {
            this.props.onDuplicateQuery(query);
          }
        },
        {
          label: "Delete",
          click: () => {
            if (window.confirm("Are you sure?")) {
              this.props.onDeleteQuery(query.id);
            }
          }
        }
      ]);
      menu.popup({ window: remote.getCurrentWindow() });
    });
  }

  render() {
    const items = this.props.queries.map(query => {
      const className = classNames({
        "is-selected": this.props.selectedQueryId === query.id
      });
      return (
        <li
          key={query.id}
          className={className}
          onClick={() => this.handleClickItem(query)}
          onContextMenu={() => this.handleContextMenu(query)}
        >
          {query.title}
        </li>
      );
    });

    return (
      <div className="QueryList">
        <div className="QueryList-new">
          <i className="fa fa-plus" onClick={() => this.handleClickNew()} />
        </div>
        <ul className="QueryList-list">{items}</ul>
      </div>
    );
  }
}
