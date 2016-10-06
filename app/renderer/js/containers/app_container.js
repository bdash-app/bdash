import React from 'react';
import Container from 'react-micro-container';
import _ from 'lodash';
import uuid from 'uuid';
import GlobalMenu from '../components/global_menu/global_menu';
import QueryPanel from '../components/query_panel/query_panel';
import ConnectionPanel from '../components/connection_panel/connection_panel';
import HistoryPanel from '../components/history_panel/history_panel';
import SettingPanel from '../components/setting_panel/setting_panel';
import Executor from '../services/executor';

export default class AppContainer extends Container {
  constructor() {
    super();
    this.state = JSON.parse(localStorage.getItem('state') || '{}');
  }

  update(state) {
    this.setState(state, () => {
      localStorage.setItem('state', JSON.stringify(this.state));
    });
  }

  updateQuery(query, nextState, { save } = { save: true }) {
    let queries = this.state.queries.map(q => {
      if (query.id === q.id) {
        return Object.assign({}, q, nextState);
      }
      else {
        return q;
      }
    });

    if (save) {
      this.update({ queries });
    }
    else {
      this.setState({ queries });
    }
  }

  updateConnection(connection, nextState) {
    let connections = this.state.connections.map(c => {
      if (connection.id === c.id) {
        return Object.assign({}, c, nextState);
      }
      else {
        return c;
      }
    });

    this.update({ connections });
  }

  componentDidMount() {
    this.subscribe({
      execute: this.handleExecute,
      changeSql: this.handleChangeSql,
      changeTitle: this.handleChangeTitle,
      changeConnection: this.handleChangeConnection,
      selectGlobalMenu: this.handleSelectGlobalMenu,
      addNewQuery: this.handleAddNewQuery,
      deleteQuery: this.handleDeleteQuery,
      selectQuery: this.handleSelectQuery,
      updateChart: this.handleUpdateChart,
      addNewConnection: this.handleAddNewConnection,
      selectConnection: this.handleSelectConnection,
      updateSetting: this.handleUpdateSetting,
      openConnectionFormModal: this.handleOpenConnectionFormModal,
      changeConnectionFormModalValue: this.handleChangeConnectionFormModalValue,
      closeConnectionFormModal: this.handleCloseConnectionFormModal,
      saveConnectionFormModal: this.handleSaveConnectionFormModal,
      deleteConnection: this.handleDeleteConnection,
      executeConnectionTest: this.handleExecuteConnectionTest,
      selectTable: this.handleSelectTable,
    });
  }

  handleChangeSql(query, sql) {
    this.updateQuery(query, { sql });
  }

  handleExecute(query) {
    let connection = _.find(this.state.connections, { id: query.connectionId });
    let { type } = connection;
    this.updateQuery(query, { status: 'working' }, { save: false });
    Executor.execute(type, query.sql, connection).then(({ fields, rows, runtime }) => {
      this.updateQuery(query, { status: 'success', fields, rows, runtime });
    }).catch(err => {
      this.updateQuery(query, { status: 'fail', error: err.message });
    });
  }

  handleChangeTitle(query, title) {
    this.updateQuery(query, { title });
  }

  handleChangeConnection(query, connectionId) {
    this.updateQuery(query, { connectionId });
  }

  handleSelectGlobalMenu(name) {
    this.update({ selectedGlobalMenu: name });
  }

  handleAddNewQuery() {
    let id = uuid();
    let newQuery = { id: id, title: 'New Query' };
    this.update({
      queries: [newQuery].concat(this.state.queries),
      selectedQueryId: id,
    });
  }

  handleDeleteQuery(id) {
    let queries = this.state.queries.filter(q => q.id !== id);
    this.update({ queries, selectedQueryId: null });
  }

  handleSelectQuery(id) {
    this.update({ selectedQueryId: id });
  }

  handleUpdateChart(query, chartParams) {
    let chart = Object.assign({}, query.chart, chartParams);
    this.updateQuery(query, { chart });
  }

  handleAddNewConnection() {
    this.setState({ connectionFormValues: {}, connectionTest: null });
  }

  handleSelectConnection(id) {
    this.update({ selectedConnectionId: id });
    this.fetchTables(id);
  }

  handleUpdateSetting(setting) {
    this.update({ setting });
  }

  handleOpenConnectionFormModal({ connectionId }) {
    let connectionFormValues = {};
    let connection = _.find(this.state.connections, { id: connectionId });
    if (connection) {
      connectionFormValues = Object.assign({}, connection);
    }

    this.update({ connectionFormValues, connectionTest: null });
  }

  handleChangeConnectionFormModalValue(name, value) {
    let connectionFormValues = Object.assign({}, this.state.connectionFormValues, {
      [name]: value,
    });
    this.update({ connectionFormValues });
  }

  handleCloseConnectionFormModal() {
    this.update({ connectionFormValues: null });
  }

  handleSaveConnectionFormModal() {
    let connectionFormValues = this.state.connectionFormValues;
    let connections;
    if (connectionFormValues.id) {
      connections = this.state.connections.map(c => {
        if (c.id === connectionFormValues.id) {
          return Object.assign({}, connectionFormValues);
        }
        else {
          return c;
        }
      });
    }
    else {
      let newConnection = Object.assign({ id: uuid() }, connectionFormValues);
      connections = [newConnection].concat(this.state.connections);
    }
    this.update({ connections, connectionFormValues: null });
  }

  handleDeleteConnection({ connectionId }) {
    let connections = this.state.connections.filter(c => c.id !== connectionId);
    this.update({ connections, selectedConnectionId: null });
  }

  handleExecuteConnectionTest(connection) {
    this.update({ connectionTest: 'working' });
    Executor.execute(connection.type, 'select 1', connection)
      .then(() => this.update({ connectionTest: 'success' }))
      .catch(() => this.update({ connectionTest: 'fail' }));
  }

  handleSelectTable(connection, table) {
    let tableName = table.table_schema ? `${table.table_schema}.${table.table_name}` : table.table_name;

    this.updateConnection(connection, { selectedTable: tableName, tableSummary: null });
    Executor.fetchTableSummary(tableName, connection).then(tableSummary => {
      this.updateConnection(connection, { selectedTable: tableName, tableSummary });
    }).catch(err => {
      console.error(err);
    });
  }

  fetchTables(id) {
    let connection = _.find(this.state.connections, { id });
    let query;
    if (connection.type === 'mysql') {
      query = `select table_name, table_type from information_schema.tables where table_schema = '${connection.database}'`;
    }

    if (connection.type === 'postgres') {
      query = "select table_schema, table_name, table_type from information_schema.tables where table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')";
    }

    Executor.execute(connection.type, query, connection).then(res => {
      connection.tables = res.rows;
      this.update({ connections: this.state.connections });
    }).catch(err => {
      console.log(err);
    });
  }

  getCurrentPanel() {
    switch (this.state.selectedGlobalMenu) {
    case 'query': return QueryPanel;
    case 'connection': return ConnectionPanel;
    case 'history': return HistoryPanel;
    case 'setting': return SettingPanel;
    }
  }

  render() {
    let Panel = this.getCurrentPanel();
    return (
      <div className="layout-app">
        <div className="layout-app-menu">
          <GlobalMenu dispatch={this.dispatch} {...this.state} />
        </div>
        <div className="layout-app-main">
          <Panel dispatch={this.dispatch} {...this.state} />
        </div>
      </div>
    );
  }
}
