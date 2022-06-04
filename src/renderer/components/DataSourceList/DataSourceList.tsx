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

const DataSourceList: React.FC<Props> = ({
  dataSources,
  selectedDataSourceId,
  defaultDataSourceId,
  onClickNew,
  onSelect,
  onEdit,
  onReload,
  onDelete,
  changeDefaultDataSourceId,
}) => {
  const handleContextMenu = (id: number): void => {
    if (id !== selectedDataSourceId) {
      const dataSource = find(id);
      if (dataSource) {
        onSelect(dataSources[id]);
      }
    }

    setImmediate(() => {
      const menu = remote.Menu.buildFromTemplate([
        {
          label: "Edit",
          click: (): void => {
            const dataSource = find(id);
            if (dataSource) {
              onEdit(dataSource);
            }
          },
        },
        {
          label: "Reload",
          click: (): void => {
            const dataSource = find(id);
            if (dataSource) {
              onReload(dataSource);
            }
          },
        },
        {
          label: "Set as default",
          type: "checkbox",
          checked: id === defaultDataSourceId,
          click: (): void => {
            changeDefaultDataSourceId(id);
          },
        },
        {
          label: "Delete",
          click: (): void => {
            if (window.confirm("Are you sure?")) {
              onDelete(id);
            }
          },
        },
      ]);
      menu.popup({ window: remote.getCurrentWindow() });
    });
  };

  const find = (id: number): DataSourceType | undefined => {
    return dataSources.find((d) => d.id === id);
  };

  const render = (): React.ReactElement => {
    const items = dataSources.map((dataSource) => {
      const className = classNames({
        "is-selected": selectedDataSourceId === dataSource.id,
      });
      const label: string = dataSource.id === defaultDataSourceId ? dataSource.name + " (default)" : dataSource.name;
      return (
        <li
          key={dataSource.id}
          className={className}
          onContextMenu={(): void => handleContextMenu(dataSource.id)}
          onClick={(): void => onSelect(dataSource)}
        >
          {label}
        </li>
      );
    });

    return (
      <div className="DataSourceList">
        <div className={classNames("DataSourceList-new", { darwin: process.platform === "darwin" })}>
          <i className="fas fa-plus" onClick={onClickNew} />
        </div>
        <ul className="DataSourceList-list">{items}</ul>
      </div>
    );
  };

  return render();
};

export default DataSourceList;
