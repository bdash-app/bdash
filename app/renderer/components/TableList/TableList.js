import React from 'react';
import classNames from 'classnames';

export default class TableList extends React.Component {
  handleClickTable(table) {
    this.props.onSelectTable(this.props.dataSource, table);
  }

  handleChangeTableFilter(e) {
    let value = e.target.value;
    this.props.onChangeTableFilter(this.props.dataSource, value);
  }

  renderItem(dataSource, table, key) {
    let { selectedTable, tableFilter } = dataSource;
    let schema = table.schema ? `${table.schema}.` : '';
    let tableName = schema + table.name;
    if (tableFilter && tableName.indexOf(tableFilter) === -1) {
      return null;
    }
    let className = classNames({
      'is-view': table.type.toLowerCase() === 'view',
      'is-selected': (
        selectedTable &&
        selectedTable.name === table.name &&
        selectedTable.schema === table.schema
      ),
    });

    return <li
      className={className}
      key={key}
      onClick={() => this.handleClickTable(table)}
    >
      <i className="fa fa-table" /> {`${schema}${table.name}`}
    </li>;
  }

  render() {
    let dataSource = this.props.dataSource;
    if (!dataSource) return null;

    let items = (dataSource.tables || []).map((table, i) => {
      return this.renderItem(dataSource, table, i);
    });

    return <div className="TableList">
      <div className="TableList-filter">
        <input type="search" value={dataSource.tableFilter} onChange={(e) => this.handleChangeTableFilter(e)} />
      </div>
      <ul>{items}</ul>
    </div>;
  }
}
