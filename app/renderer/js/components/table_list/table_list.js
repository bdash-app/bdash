import React from 'react';
import classNames from 'classnames';

export default class TableList extends React.Component {
  handleClickTable(dataSource, table) {
    this.props.dispatch('selectTable', this.props.dataSource, dataSource, table);
  }

  renderItem(dataSource, table, key) {
    let schema = table.table_schema ? `${table.table_schema}.` : '';
    let tableName = schema + table.table_name;
    let className = classNames({
      'is-view': table.table_type.toLowerCase() === 'view',
      'is-selected': dataSource.selectedTable === tableName,
    });

    return <li
      className={className}
      key={key}
      onClick={() => this.handleClickTable(table)}
    >
      <i className="fa fa-table"></i> {`${schema}${table.table_name}`}
    </li>;
  }

  render() {
    let dataSource = this.props.dataSource;
    if (!dataSource) return null;

    let items = (dataSource.tables || []).map((table, i) => {
      return this.renderItem(dataSource, table, i);
    });

    return <div className="TableList">
      <ul>{items}</ul>
    </div>;
  }
}
