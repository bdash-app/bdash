import React from 'react';
import classNames from 'classnames';

export default class TableList extends React.Component {
  handleClickTable(connection, table) {
    this.props.dispatch('selectTable', this.props.connection, connection, table);
  }

  renderItem(connection, table, key) {
    let schema = table.table_schema ? `${table.table_schema}.` : '';
    let tableName = schema + table.table_name;
    let className = classNames({
      'is-view': table.table_type.toLowerCase() === 'view',
      'is-selected': connection.selectedTable === tableName,
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
    let connection = this.props.connection;
    if (!connection) return null;

    let items = (connection.tables || []).map((table, i) => {
      return this.renderItem(connection, table, i);
    });

    return <div className="TableList">
      <ul>{items}</ul>
    </div>;
  }
}
