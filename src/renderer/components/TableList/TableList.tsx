import * as React from "react";
import * as classNames from "classnames";

export default class TableList extends React.Component<any, any> {
  handleClickTable(table) {
    this.props.onSelectTable(this.props.dataSource, table);
  }

  handleChangeTableFilter(e) {
    const value = e.target.value;
    this.props.onChangeTableFilter(this.props.dataSource, value);
  }

  renderItem(dataSource, table, key) {
    const { selectedTable, tableFilter } = dataSource;
    const schema = table.schema ? `${table.schema}.` : "";
    const tableName = schema + table.name;
    if (tableFilter && tableName.indexOf(tableFilter) === -1) {
      return null;
    }
    const className = classNames({
      "is-view": table.type.toLowerCase() === "view",
      "is-selected":
        selectedTable &&
        selectedTable.name === table.name &&
        selectedTable.schema === table.schema
    });

    return (
      <li
        className={className}
        key={key}
        onClick={() => this.handleClickTable(table)}
      >
        <i className="fa fa-table" /> {`${schema}${table.name}`}
      </li>
    );
  }

  render() {
    const dataSource = this.props.dataSource;
    if (!dataSource) return null;

    const items = (dataSource.tables || []).map((table, i) => {
      return this.renderItem(dataSource, table, i);
    });

    return (
      <div className="TableList">
        <div className="TableList-filter">
          <input
            type="search"
            value={dataSource.tableFilter}
            onChange={e => this.handleChangeTableFilter(e)}
          />
        </div>
        <ul>{items}</ul>
      </div>
    );
  }
}
