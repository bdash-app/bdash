import React from "react";
import classNames from "classnames";
import { remote } from "electron";
import { DataSourceType } from "../../pages/DataSource/DataSourceStore";

type Props = {
  readonly dataSources: DataSourceType[];
  readonly selectedDataSourceId: number | null;
  readonly defaultDataSourceId: number | undefined;
  readonly onClickNew: () => void;
  readonly onSelect: (dataSource: DataSourceType) => void;
  readonly onEdit: (dataSource: DataSourceType) => void;
  readonly onReload: (dataSource: DataSourceType) => void;
  readonly onDelete: (id: number) => void;
  readonly changeDefaultDataSourceId: (dataSourceId: number) => void;
};

export default class DataSourceList extends React.Component<Props> {
  handleContextMenu(id: number): void {
    if (id !== this.props.selectedDataSourceId) {
      const dataSource = this.find(id);
      if (dataSource) {
        this.props.onSelect(this.props.dataSources[id]);
      }
    }

    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Edit",
          click: (): void => {
            const dataSource = this.find(id);
            if (dataSource) {
              this.props.onEdit(dataSource);
            }
          },
        },
        {
          label: "Reload",
          click: (): void => {
            const dataSource = this.find(id);
            if (dataSource) {
              this.props.onReload(dataSource);
            }
          },
        },
        {
          label: "Set as default",
          type: "checkbox",
          checked: id === this.props.defaultDataSourceId,
          click: (): void => {
            this.props.changeDefaultDataSourceId(id);
          },
        },
        {
          label: "Delete",
          click: (): void => {
            if (window.confirm("Are you sure?")) {
              this.props.onDelete(id);
            }
          },
        },
      ]);
      menu.popup({ window: remote.getCurrentWindow() });
    });
  }

  find(id: number): DataSourceType | undefined {
    return this.props.dataSources.find((d) => d.id === id);
  }

  override render(): React.ReactNode {
    const items = this.props.dataSources.map((dataSource) => {
      const className = classNames({
        "is-selected": this.props.selectedDataSourceId === dataSource.id,
      });
      const label: string =
        dataSource.id === this.props.defaultDataSourceId ? dataSource.name + " (default)" : dataSource.name;
      return (
        <li
          key={dataSource.id}
          className={className}
          onContextMenu={(): void => this.handleContextMenu(dataSource.id)}
          onClick={(): void => this.props.onSelect(dataSource)}
        >
          {label}
        </li>
      );
    });

    return (
      <div className="DataSourceList">
        <div className={classNames("DataSourceList-new", { darwin: process.platform === "darwin" })}>
          <i className="fas fa-plus" onClick={this.props.onClickNew} />
        </div>
        <ul className="DataSourceList-list">{items}</ul>
      </div>
    );
  }
}
