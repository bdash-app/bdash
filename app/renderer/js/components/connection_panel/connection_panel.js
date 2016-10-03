import React from 'react';
import _ from 'lodash';
import ConnectionList from '../connection_list/connection_list';
import Executor from '../../services/executor';
import ConnectionFormModal from '../connection_form_modal/connection_form_modal';

export default class ConnectionPanel extends React.Component {
  handleClickTable(connection, table) {
    let tableName = table.table_schema ? `${table.table_schema}.${table.table_name}` : table.table_name;

    Executor.fetchTableSummary(tableName, connection).then(res => {
      this.setState({ tableSummary: res });
    });
  }

  renderTableSummary() {
    if (!this.state || !this.state.tableSummary) return;

    let tableSummary = this.state.tableSummary;
    let fields = tableSummary.fields.map(f => f.name);
    let heads = fields.map((f, i) => <th key={i}>{f}</th>);
    let rows = tableSummary.rows.map((row, i) => {
      let cols = Object.keys(row).map(k => <td key={`${k}-{i}`}>{row[k]}</td>);
      return <tr key={i}>{cols}</tr>;
    });

    return (
      <div>
        <h3>Table Summary</h3>
        <table>
          <thead><tr>{heads}</tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }

  getCurrentConnection() {
    return _.find(this.props.connections, { id: this.props.selectedConnectionId });
  }

  handleClickEdit() {
    this.props.dispatch('openConnectionFormModal', { connectionId: this.props.selectedConnectionId });
  }

  handleClickDelete() {
    this.props.dispatch('deleteConnection', { connectionId: this.props.selectedConnectionId });
  }

  renderMain() {
    let connection = this.getCurrentConnection();

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
        <button onClick={() => this.handleClickEdit()}>Edit</button>
        <button onClick={() => this.handleClickDelete()}>Delete</button>
        <div className="ConnectionSetting">
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
        <ConnectionFormModal
          dispatch={this.props.dispatch}
          connectionTest={this.props.connectionTest}
          connectionFormValues={this.props.connectionFormValues}
          />
      </div>
    );
  }
}
