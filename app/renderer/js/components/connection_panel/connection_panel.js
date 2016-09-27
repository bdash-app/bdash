import React from 'react';
import _ from 'lodash';
import ConnectionList from '../connection_list/connection_list';
import Executor from '../../services/executor';

export default class ConnectionPanel extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  handleClickTable(connection, table) {
    Executor.fetchTableSummaryPostgres(`${table.table_schema}.${table.table_name}`, connection).then(res => {
      this.setState({ tableSummary: res.rows });
    });
  }

  renderTableSummary() {
    if (!this.state.tableSummary) return;

    let rows = this.state.tableSummary.map((row, i) => {
      return (
        <tr key={i}>
          <td>{row.name}</td>
          <td>{row.type}</td>
          <td>{row.not_null ? 'NOT NULL' : ''}</td>
          <td>{row.default_value}</td>
        </tr>
      );
    });

    return (
      <div>
        <h3>Table Summary</h3>
        <table>
          <thead>
            <tr>
              <th>name</th>
              <th>type</th>
              <th>null</th>
              <th>default</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }

  renderMain() {
    let connection = _.find(this.props.connections, { id: this.props.selectedConnectionId });

    if (!connection) {
      return <div className="ConnectionPanel-main"></div>;
    }

    let tables = (connection.tables || []).map((table, i) => {
      let schema = table.table_schema ? `${table.table_schema}.` : '';
      let className = table.table_type.toLowerCase() === 'view' ? 'is-view' : '';
      return <li
        className={className}
        key={i}
        onClick={() => this.handleClickTable(connection, table)}
      >
        <i className="fa fa-table"></i> {`${schema}${table.table_name}`}
      </li>;
    });

    return (
      <div className="ConnectionPanel-main">
        <div className="ConnectionSetting">
          <h3>name</h3>
          <div>{connection.name}</div>

          <h3>type</h3>
          <div>{connection.type}</div>

          <h3>host</h3>
          <div>{connection.host}</div>

          <h3>user</h3>
          <div>{connection.user}</div>

          <h3>password</h3>
          <div>{connection.password}</div>

          <h3>database</h3>
          <div>{connection.database}</div>

          <h3>tables</h3>
          <ul className="ConnectionSetting-tables">{tables}</ul>

          {this.renderTableSummary()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="ConnectionPanel">
        <div className="ConnectionPanel-list">
          <ConnectionList {...this.props} />
        </div>
        {this.renderMain()}
      </div>
    );
  }
}
