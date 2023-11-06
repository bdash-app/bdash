import React, { MouseEvent } from "react";
import classNames from "classnames";
import { DataSourceType } from "../../pages/DataSource/DataSourceStore";
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/ReactContexify.css";

const MENU_ID = "DATA_SOURCE_LIST_MENU";

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
  const handleEdit = () => {
    if (selectedDataSourceId === null) {
      return;
    }
    const dataSource = find(selectedDataSourceId);
    if (dataSource) {
      onEdit(dataSource);
    }
  };

  const handleReload = () => {
    if (selectedDataSourceId === null) {
      return;
    }
    const dataSource = find(selectedDataSourceId);
    if (dataSource) {
      onReload(dataSource);
    }
  };

  const handleSetAsDefault = () => {
    if (selectedDataSourceId === null) {
      return;
    }
    changeDefaultDataSourceId(selectedDataSourceId);
  };

  const handleDelete = () => {
    if (selectedDataSourceId === null) {
      return;
    }
    if (window.confirm("Are you sure?")) {
      onDelete(selectedDataSourceId);
    }
  };

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleContextMenu = (event: MouseEvent, id: number): void => {
    show({
      event,
      props: {
        key: "value",
      },
    });

    if (id !== selectedDataSourceId) {
      const dataSource = find(id);
      if (dataSource) {
        onSelect(dataSource);
      }
    }
  };

  const find = (id: number): DataSourceType | undefined => {
    return dataSources.find((d) => d.id === id);
  };

  const items = dataSources.map((dataSource) => {
    const className = classNames({
      "is-selected": selectedDataSourceId === dataSource.id,
    });
    const label: string = dataSource.id === defaultDataSourceId ? dataSource.name + " (default)" : dataSource.name;
    return (
      <li
        key={dataSource.id}
        className={className}
        onContextMenu={(event): void => handleContextMenu(event, dataSource.id)}
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
      <Menu id={MENU_ID}>
        <Item onClick={handleEdit}>Edit</Item>
        <Item onClick={handleReload}>Reload</Item>
        <Item onClick={handleSetAsDefault}>Set as default</Item>
        <Item onClick={handleDelete}>Delete</Item>
      </Menu>
      <ul className="DataSourceList-list">{items}</ul>
    </div>
  );
};

export default DataSourceList;
