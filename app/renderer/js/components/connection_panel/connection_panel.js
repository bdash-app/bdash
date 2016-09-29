import React from 'react';
import _ from 'lodash';
import ConnectionList from '../connection_list/connection_list';
import Executor from '../../services/executor';
import Modal from 'react-modal';

export default class ConnectionPanel extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  handleClickTable(connection, table) {
    let tableName = table.table_schema ? `${table.table_schema}.${table.table_name}` : table.table_name;

    Executor.fetchTableSummary(tableName, connection).then(res => {
      this.setState({ tableSummary: res });
    });
  }

  renderTableSummary() {
    if (!this.state.tableSummary) return;

    let tableSummary = this.state.tableSummary;
    console.log(tableSummary);
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
        <div className="ConnectionSetting">
          <h3>tables</h3>
          <ul className="ConnectionSetting-tables">{tables}</ul>

          {this.renderTableSummary()}
        </div>
      </div>
    );
  }

  renderModal() {
    let connection = this.getCurrentConnection();
    let style = {
      overlay: {
        backgroundColor: '',
      },
      content: {
        top: 0,
        bottom: null,
        left: 0,
        right: 0,
        margin: '0 auto',
        width: '400px',
        borderRadius: 0,
        backgroundColor: '#EFEFEF',
        border: '1px solid #CCC',
        borderTop: 'none',
        boxShadow: '1px 1px 10px rgba(0,0,0,0.2), 0 6px 10px -6px rgba(0,0,0,0.2) inset',
        outline: 'none',
      },
    };
    return <Modal isOpen={true} style={style} className="ConnectionFormModal">
      <table>
        <tr>
          <th>Name</th>
          <td><input type="text" value={connection.name} /></td>
        </tr>
        <tr>
          <th>Type</th>
          <td>
            <select value={connection.type}>
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>Host</th>
          <td><input type="text" value={connection.host} /></td>
        </tr>
        <tr>
          <th>Port</th>
          <td><input type="text" value={connection.port} placeholder="3306" /></td>
        </tr>
        <tr>
          <th>Username</th>
          <td><input type="text" value={connection.user} /></td>
        </tr>
        <tr>
          <th>Password</th>
          <td><input type="password" value={connection.password} /></td>
        </tr>
        <tr>
          <th>Database</th>
          <td><input type="text" value={connection.database} /></td>
        </tr>
      </table>

      <div className="ConnectionFormModal-connectionTest">
        <button>Connection Test</button>
        <i className="fa fa-check"></i>
        <i className="fa fa-close"></i>
        <i className="fa fa-spin fa-refresh"></i>
      </div>
      <div className="ConnectionFormModal-buttons">
        <button>Cancel</button>
        <button>Save</button>
      </div>
    </Modal>;
  }

  render() {
    return (
      <div className="ConnectionPanel">
        <div className="ConnectionPanel-list">
          <ConnectionList {...this.props} />
        </div>
        {this.renderMain()}
        {this.renderModal()}
      </div>
    );
  }
}
