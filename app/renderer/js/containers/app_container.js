import React from 'react';
import Container from 'react-micro-container';
import _ from 'lodash';
import uuid from 'uuid';
import GlobalMenu from '../components/global_menu/global_menu';
import QueryPanel from '../components/query_panel/query_panel';
import DataSourcePanel from '../components/data_source_panel/data_source_panel';
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

  updateDataSource(dataSource, nextState) {
    let dataSources = this.state.dataSources.map(c => {
      if (dataSource.id === c.id) {
        return Object.assign({}, c, nextState);
      }
      else {
        return c;
      }
    });

    this.update({ dataSources });
  }

  componentDidMount() {
    this.subscribe({
      execute: this.handleExecute,
      changeSql: this.handleChangeSql,
      changeTitle: this.handleChangeTitle,
      changeDataSource: this.handleChangeDataSource,
      selectGlobalMenu: this.handleSelectGlobalMenu,
      addNewQuery: this.handleAddNewQuery,
      deleteQuery: this.handleDeleteQuery,
      selectQuery: this.handleSelectQuery,
      updateChart: this.handleUpdateChart,
      addNewDataSource: this.handleAddNewDataSource,
      selectDataSource: this.handleSelectDataSource,
      updateSetting: this.handleUpdateSetting,
      openDataSourceFormModal: this.handleOpenDataSourceFormModal,
      changeDataSourceFormModalValue: this.handleChangeDataSourceFormModalValue,
      closeDataSourceFormModal: this.handleCloseDataSourceFormModal,
      saveDataSourceFormModal: this.handleSaveDataSourceFormModal,
      deleteDataSource: this.handleDeleteDataSource,
      executeConnectionTest: this.handleExecuteConnectionTest,
      selectTable: this.handleSelectTable,
    });
  }

  handleChangeSql(query, sql) {
    this.updateQuery(query, { sql });
  }

  handleExecute(query) {
    let dataSource = _.find(this.state.dataSources, { id: query.dataSourceId });
    let { type } = dataSource;
    this.updateQuery(query, { status: 'working' }, { save: false });
    Executor.execute(type, query.sql, dataSource).then(({ fields, rows, runtime }) => {
      this.updateQuery(query, { status: 'success', fields, rows, runtime });
    }).catch(err => {
      this.updateQuery(query, { status: 'fail', error: err.message });
    });
  }

  handleChangeTitle(query, title) {
    this.updateQuery(query, { title });
  }

  handleChangeDataSource(query, dataSourceId) {
    this.updateQuery(query, { dataSourceId });
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

  handleAddNewDataSource() {
    this.setState({ dataSourceFormValues: {}, connectionTest: null });
  }

  handleSelectDataSource(id) {
    this.update({ selectedDataSourceId: id });
    this.fetchTables(id);
  }

  handleUpdateSetting(setting) {
    this.update({ setting });
  }

  handleOpenDataSourceFormModal({ dataSourceId }) {
    let dataSourceFormValues = {};
    let dataSource = _.find(this.state.dataSources, { id: dataSourceId });
    if (dataSource) {
      dataSourceFormValues = Object.assign({}, dataSource);
    }

    this.update({ dataSourceFormValues, connectionTest: null });
  }

  handleChangeDataSourceFormModalValue(name, value) {
    let dataSourceFormValues = Object.assign({}, this.state.dataSourceFormValues, {
      [name]: value,
    });
    this.update({ dataSourceFormValues });
  }

  handleCloseDataSourceFormModal() {
    this.update({ dataSourceFormValues: null });
  }

  handleSaveDataSourceFormModal() {
    let dataSourceFormValues = this.state.dataSourceFormValues;
    let dataSources;
    if (dataSourceFormValues.id) {
      dataSources = this.state.dataSources.map(c => {
        if (c.id === dataSourceFormValues.id) {
          return Object.assign({}, dataSourceFormValues);
        }
        else {
          return c;
        }
      });
    }
    else {
      let newDataSource = Object.assign({ id: uuid() }, dataSourceFormValues);
      dataSources = [newDataSource].concat(this.state.dataSources);
    }
    this.update({ dataSources, dataSourceFormValues: null });
  }

  handleDeleteDataSource({ dataSourceId }) {
    let dataSources = this.state.dataSources.filter(c => c.id !== dataSourceId);
    this.update({ dataSources, selectedDataSourceId: null });
  }

  handleExecuteConnectionTest(dataSource) {
    this.update({ connectionTest: 'working' });
    Executor.execute(dataSource.type, 'select 1', dataSource)
      .then(() => this.update({ connectionTest: 'success' }))
      .catch(() => this.update({ connectionTest: 'fail' }));
  }

  handleSelectTable(dataSource, table) {
    let tableName = table.table_schema ? `${table.table_schema}.${table.table_name}` : table.table_name;

    this.updateDataSource(dataSource, { selectedTable: tableName, tableSummary: null });
    Executor.fetchTableSummary(tableName, dataSource).then(tableSummary => {
      this.updateDataSource(dataSource, { selectedTable: tableName, tableSummary });
    }).catch(err => {
      console.error(err);
    });
  }

  fetchTables(id) {
    let dataSource = _.find(this.state.dataSources, { id });
    let query;
    if (dataSource.type === 'mysql') {
      query = `select table_name, table_type from information_schema.tables where table_schema = '${dataSource.database}'`;
    }

    if (dataSource.type === 'postgres') {
      query = "select table_schema, table_name, table_type from information_schema.tables where table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')";
    }

    Executor.execute(dataSource.type, query, dataSource).then(res => {
      dataSource.tables = res.rows;
      this.update({ dataSources: this.state.dataSources });
    }).catch(err => {
      console.log(err);
    });
  }

  getCurrentPanel() {
    switch (this.state.selectedGlobalMenu) {
    case 'query': return QueryPanel;
    case 'dataSource': return DataSourcePanel;
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
