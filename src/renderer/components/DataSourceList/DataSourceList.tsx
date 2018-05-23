import React from "react";
import classNames from "classnames";
import { remote } from "electron";

export default class DataSourceList extends React.Component<any, any> {
  handleContextMenu(id) {
    if (id !== this.props.selectedDataSourceId) {
      this.props.onSelect(id);
    }

    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Edit",
          click: () => {
            this.props.onEdit(id);
          }
        },
        {
          label: "Reload",
          click: () => {
            this.props.onReload(id);
          }
        },
        {
          label: "Delete",
          click: () => {
            if (window.confirm("Are you sure?")) {
              this.props.onDelete(id);
            }
          }
        }
      ]);
      menu.popup({ window: remote.getCurrentWindow() });
    });
  }

  render() {
    const items = this.props.dataSources.map(dataSource => {
      const className = classNames({
        "is-selected": this.props.selectedDataSourceId === dataSource.id
      });
      return (
        <li
          key={dataSource.id}
          className={className}
          onContextMenu={() => this.handleContextMenu(dataSource.id)}
          onClick={() => this.props.onSelect(dataSource.id)}
        >
          {dataSource.name}
        </li>
      );
    });

    return (
      <div className="DataSourceList">
        <div className="DataSourceList-new">
          <i className="fa fa-plus" onClick={() => this.props.onClickNew()} />
        </div>
        <ul className="DataSourceList-list">{items}</ul>
      </div>
    );
  }
}
