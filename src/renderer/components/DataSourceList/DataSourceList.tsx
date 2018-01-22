import * as React from "react";
import * as classNames from "classnames";
import { remote } from "electron";

export default class DataSourceList extends React.Component<any, any> {
  handleContextMenu(id) {
    if (id !== this.props.selectedDataSourceId) {
      this.props.onSelect(id);
    }

    setImmediate(() => {
      let menu = remote.Menu.buildFromTemplate([
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
      menu.popup(remote.getCurrentWindow());
    });
  }

  render() {
    let items = this.props.dataSources.map(dataSource => {
      let className = classNames({
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
