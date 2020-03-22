import React from "react";
import classNames from "classnames";
import { DataSourceType, TableType } from "../../pages/DataSource/DataSourceStore";
import LoadingIcon from "../LoadingIcon";

type Props = {
  readonly dataSource?: DataSourceType;
  readonly onSelectTable: (dataSource: DataSourceType, table: TableType) => void;
  readonly onChangeTableFilter: (dataSource: DataSourceType, value: string) => void;
};

export default class TableList extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.handleChangeTableFilter = this.handleChangeTableFilter.bind(this);
  }

  handleClickTable(table: TableType): void {
    this.props.onSelectTable(this.props.dataSource!, table);
  }

  handleChangeTableFilter(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    this.props.onChangeTableFilter(this.props.dataSource!, value);
  }

  renderItem(dataSource: DataSourceType, table: TableType, key: number): React.ReactNode {
    const { selectedTable, tableFilter } = dataSource;
    const schema = table.schema ? `${table.schema}.` : "";
    const tableName = schema + table.name;
    if (tableFilter && tableName.indexOf(tableFilter) === -1) {
      return null;
    }
    const className = classNames({
      "is-view": table.type.toLowerCase() === "view",
      "is-selected": selectedTable && selectedTable.name === table.name && selectedTable.schema === table.schema
    });

    return (
      <li className={className} key={key} onClick={(): void => this.handleClickTable(table)}>
        <i className="fas fa-table" /> {`${schema}${table.name}`}
      </li>
    );
  }

  render(): React.ReactNode {
    const dataSource = this.props.dataSource;
    if (!dataSource) return null;

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

    const items = (dataSource.tables || []).map((table: TableType, i: number) => {
      return this.renderItem(dataSource, table, i);
    });

    return (
      <div className="TableList">
        <div className="TableList-filter">
          <i className="fas fa-search" />
          <input type="search" value={dataSource.tableFilter ?? ""} onChange={this.handleChangeTableFilter} />
        </div>
        <ul className="TableList-list">{items}</ul>
      </div>
    );
  }
}
