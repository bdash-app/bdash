import React from "react";
import classNames from "classnames";
import { DataSourceType, TableType } from "../../pages/DataSource/DataSourceStore";
import LoadingIcon from "../LoadingIcon";

type Props = {
  readonly dataSource?: DataSourceType;
  readonly onSelectTable: (dataSource: DataSourceType, table: TableType) => void;
  readonly onChangeTableFilter: (dataSource: DataSourceType, value: string) => void;
};

const TableList = React.memo<Props>(function TableList({ dataSource, onSelectTable, onChangeTableFilter }) {
  if (!dataSource) return null;

  const handleClickTable = (table: TableType): void => {
    onSelectTable(dataSource, table);
  };

  const handleChangeTableFilter = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    onChangeTableFilter(dataSource, value);
  };

  const renderItem = (table: TableType, key: number): React.ReactNode => {
    const { selectedTable, tableFilter } = dataSource;
    const schema = table.schema ? `${table.schema}.` : "";
    const tableName = schema + table.name;
    if (tableFilter && tableName.indexOf(tableFilter) === -1) {
      return null;
    }
    const className = classNames({
      "is-view": table.type.toLowerCase() === "view",
      "is-selected": selectedTable && selectedTable.name === table.name && selectedTable.schema === table.schema,
    });

    return (
      <li className={className} key={key} onClick={(): void => handleClickTable(table)}>
        <i className="fas fa-table" /> {`${schema}${table.name}`}
      </li>
    );
  };

  if (dataSource.tableFetchingError) {
    return (
      <div className="TableList">
        <div className="TableList-error">
          <i className="fas fa-exclamation-circle"></i>
          {dataSource.tableFetchingError}
        </div>
      </div>
    );
  }

  if (dataSource.tables === null) {
    return (
      <div className="TableList">
        <div className="TableList-loading">
          <LoadingIcon />
        </div>
      </div>
    );
  }

  const items = (dataSource.tables || []).map(renderItem);

  return (
    <div className="TableList">
      <div className="TableList-filter">
        <i className="fas fa-search" />
        <input type="search" value={dataSource.tableFilter ?? ""} onChange={handleChangeTableFilter} />
      </div>
      <ul className="TableList-list">{items}</ul>
    </div>
  );
});

export default TableList;
