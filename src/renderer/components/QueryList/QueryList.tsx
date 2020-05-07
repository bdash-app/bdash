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
  constructor(props: Props) {
    super(props);
    this.handleClickNew = this.handleClickNew.bind(this);
  }

  handleClickNew(): void {
    this.props.onAddQuery();
  }

  handleClickItem(query: QueryType): void {
    this.props.onSelectQuery(query);
  }

  handleContextMenu(query: QueryType): void {
    this.props.onSelectQuery(query);
    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Duplicate",
          click: (): void => {
            this.props.onDuplicateQuery(query);
          }
        },
        {
          label: "Delete",
          click: (): void => {
            if (window.confirm("Are you sure?")) {
              this.props.onDeleteQuery(query.id);
            }
          }
        }
      ]);
      menu.popup({ window: remote.getCurrentWindow() });
    });
  }

  render(): React.ReactNode {
    const items = this.props.queries.map(query => {
      const className = classNames({
        "is-selected": this.props.selectedQueryId === query.id
      });
      return (
        <li
          key={query.id}
          className={className}
          onClick={(): void => this.handleClickItem(query)}
          onContextMenu={(): void => this.handleContextMenu(query)}
        >
          {query.title}
        </li>
      );
    });

    return (
      <div className="QueryList">
        <div className={classNames("QueryList-new", { darwin: process.platform === "darwin" })}>
          <i className="fas fa-plus" onClick={this.handleClickNew} />
        </div>
        <ul className="QueryList-list">{items}</ul>
      </div>
    );
  }
}
