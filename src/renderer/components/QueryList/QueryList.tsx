import * as React from "react";
import * as classNames from "classnames";
import { remote } from "electron";

export default class QueryList extends React.Component<any, any> {
  handleClickNew() {
    this.props.onAddQuery();
  }

  handleClickItem(query) {
    this.props.onSelectQuery(query);
  }

  handleContextMenu(query) {
    this.props.onSelectQuery(query);
    setImmediate(() => {
      let menu = remote.Menu.buildFromTemplate([
        {
          label: "Delete",
          click: () => {
            if (window.confirm("Are you sure?")) {
              this.props.onDeleteQuery(query.id);
            }
          }
        }
      ]);
      menu.popup(remote.getCurrentWindow());
    });
  }

  render() {
    let items = this.props.queries.map(query => {
      let className = classNames({
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
