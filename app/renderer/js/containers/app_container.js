import electron from 'electron';
import path from 'path';
import fs from 'fs';
import React from 'react';
import Container from 'react-micro-container';
import _ from 'lodash';
import moment from 'moment';
import GlobalMenu from '../components/global_menu/global_menu';
import QueryPanel from '../components/query_panel/query_panel';
import DataSourcePanel from '../components/data_source_panel/data_source_panel';
import HistoryPanel from '../components/history_panel/history_panel';
import SettingPanel from '../components/setting_panel/setting_panel';
import Executor from '../services/executor';
import Database from '../services/database';
import Setting from '../services/setting';
import strings from '../utils/strings';

export default class AppContainer extends Container {
  constructor() {
    super();
    this.state = {
      initialize: false,
      dataSources: [],
      queries: [],
      charts: [],
      selectedGlobalMenu: 'query',
      selectedDataSourceId: null,
      selectedQueryId: null,
      dataSourceFormValues: null,
      connectionTest: null,
    };
  }

  updateQuery(query, nextState) {
    let queries = this.state.queries.map(q => {
      if (query.id === q.id) {
        return Object.assign({}, q, nextState);
      }
      else {
        return q;
      }
    });

    this.setState({ queries });
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

    this.setState({ dataSources });
  }

  componentDidMount() {
    let home = electron.remote.app.getPath('home');
    let bdashDir = path.resolve(home, '.bdash');
    if (!fs.existsSync(bdashDir)) {
      fs.mkdirSync(bdashDir);
    }

    let dbPath = path.resolve(bdashDir, 'bdash.sqlite3');
    let schemaPath = path.resolve(__dirname, '../../../../../', 'db/schema.sql');
    let schema = fs.readFileSync(schemaPath).toString();
    let settingFilePath = path.resolve(bdashDir, 'setting.yml');
    this.db = new Database({ dbPath });
    this.setting = new Setting({ filePath: settingFilePath });

    this.db.initialize({ schema }).then(({ queries, dataSources, charts }) => {
      let hasDataSource = dataSources.length > 0;
      this.setState({
        initialize: true,
        queries,
        dataSources,
        charts,
        setting: this.setting.all(),
        dataSourceFormValues: hasDataSource ? null : {},
        selectedGlobalMenu: hasDataSource ? 'query' : 'dataSource',
      });
    }).catch(err => {
      console.error(err);
    });

    this.subscribe({
      execute: this.handleExecute,
      changeQueryBody: this.handleChangeQueryBody,
      changeEditorCursor: this.handleChangeEditorCursor,
      changeTitle: this.handleChangeTitle,
      changeDataSource: this.handleChangeDataSource,
      selectGlobalMenu: this.handleSelectGlobalMenu,
      addNewQuery: this.handleAddNewQuery,
      deleteQuery: this.handleDeleteQuery,
      selectQuery: this.handleSelectQuery,
      updateChart: this.handleUpdateChart,
      addNewDataSource: this.handleAddNewDataSource,
      selectDataSource: this.handleSelectDataSource,
      reloadDataSourceTables: this.handleReloadDataSourceTables,
      updateSetting: this.handleUpdateSetting,
      openDataSourceFormModal: this.handleOpenDataSourceFormModal,
      changeDataSourceFormModalValue: this.handleChangeDataSourceFormModalValue,
      closeDataSourceFormModal: this.handleCloseDataSourceFormModal,
      saveDataSourceFormModal: this.handleSaveDataSourceFormModal,
      deleteDataSource: this.handleDeleteDataSource,
      executeConnectionTest: this.handleExecuteConnectionTest,
      selectTable: this.handleSelectTable,
      changeQueryResultSelectedTab: this.handleChangeQueryResultSelectedTab,
      changeTableFilterValue: this.handleChangeTableFilterValue,
    });
  }

  now() {
    return moment().utc().format('YYYY-MM-DD HH:mm:ss');
  }

  findChart(queryId) {
    return this.state.charts.filter(chart => {
      return queryId === chart.queryId;
    })[0];
  }

  executor(dataSource) {
    return Executor.create(dataSource.type, dataSource.config);
  }

  handleChangeQueryResultSelectedTab(query, selectedTab) {
    if (selectedTab === 'chart' && !this.findChart(query.id)) {
      this.db.createChart({ queryId: query.id, type: 'line', updatedAt: this.now() }).then(newChart => {
        this.setState({ charts: [newChart].concat(this.state.charts) });
        this.updateQuery(query, { selectedTab });
      }).catch(err => {
        console.error(err);
      });
    }
    else {
      this.updateQuery(query, { selectedTab });
    }
  }

  handleExecute(query) {
    let dataSource = _.find(this.state.dataSources, { id: query.dataSourceId });
    let line = this.state.currentCursorLine || 1;
    let body = strings.findQueryByLine(query.body, line);

    this.updateQuery(query, { status: 'working' });
    this.executor(dataSource).execute(body).then(({ fields, rows, runtime }) => {
      let params = {
        status: 'success',
        fields: fields,
        rows: rows,
        runtime: runtime,
        runAt: this.now(),
        errorMessage: null,
      };
      this.updateQuery(query, Object.assign({ selectedTab: 'table' }, params));
      return this.db.updateQuery(query.id, Object.assign(params, {
        fields: JSON.stringify(params.fields),
        rows: JSON.stringify(params.rows),
      }));
    }).catch(err => {
      let params = {
        status: 'failure',
        fields: null,
        rows: null,
        runtime: null,
        errorMessage: err.message,
      };
      this.updateQuery(query, params);
      return this.db.updateQuery(query.id, params);
    }).catch(err => {
      console.error(err);
    });
  }

  handleChangeTitle(query, title) {
    this.updateQuery(query, { title });
    this.db.updateQuery(query.id, { title }).catch(err => {
      console.error(err);
    });
  }

  handleChangeQueryBody(query, body) {
    this.updateQuery(query, { body });
    this.db.updateQuery(query.id, { body }).catch(err => {
      console.error(err);
    });
  }

  handleChangeEditorCursor(line) {
    this.setState({ currentCursorLine: line });
  }

  handleChangeDataSource(query, dataSourceId) {
    this.updateQuery(query, { dataSourceId });
    this.db.updateQuery(query.id, { dataSourceId }).catch(err => {
      console.error(err);
    });
  }

  handleSelectGlobalMenu(name) {
    this.setState({ selectedGlobalMenu: name });
  }

  handleAddNewQuery() {
    let defaultDataSource = this.state.dataSources[0];
    if (!defaultDataSource) {
      alert('Please create data source');
      return;
    }

    let params = {
      title: 'New Query',
      dataSourceId: defaultDataSource.id,
    };

    this.db.createQuery(params).then(newQuery => {
      this.setState({
        queries: [newQuery].concat(this.state.queries),
        selectedQueryId: newQuery.id,
      });
    }).catch(err => {
      console.error(err);
    });
  }

  handleDeleteQuery(id) {
    let queries = this.state.queries.filter(q => q.id !== id);
    this.setState({ queries, selectedQueryId: null });
  }

  handleSelectQuery(id) {
    let query = _.find(this.state.queries, { id });
    if (query.body === undefined) {
      this.db.getQuery(id).then(newQuery => {
        let queries = this.state.queries.map(q => {
          if (q.id !== id) return q;
          return Object.assign({ selectedTab: 'table' }, newQuery);
        });
        this.setState({ queries });
      }).catch(err => {
        console.log(err);
      });
    }
    this.setState({ selectedQueryId: id });
  }

  handleUpdateChart(chartId, chartParams) {
    chartParams = Object.assign({}, chartParams, { updatedAt: this.now() });
    let charts = this.state.charts.map(c => {
      if (chartId === c.id) {
        return Object.assign({}, c, chartParams);
      }
      else {
        return c;
      }
    });

    this.setState({ charts });
    this.db.updateChart(chartId, chartParams).catch(err => {
      console.error(err);
    });
  }

  handleAddNewDataSource() {
    this.setState({ dataSourceFormValues: {}, connectionTest: null });
  }

  handleSelectDataSource(id) {
    this.setState({ selectedDataSourceId: id });
    this.fetchTables(id);
  }

  handleReloadDataSourceTables(id) {
    this.fetchTables(id);
  }

  handleUpdateSetting(setting) {
    this.setState({ setting: Object.assign(this.state.setting, setting) }, () => {
      this.setting.update(setting);
    });
  }

  handleOpenDataSourceFormModal(id) {
    let dataSourceFormValues = {};
    let dataSource = _.find(this.state.dataSources, { id });
    if (dataSource) {
      dataSourceFormValues = Object.assign({}, dataSource);
    }

    this.setState({ dataSourceFormValues, connectionTest: null });
  }

  handleChangeDataSourceFormModalValue(name, value) {
    let newValue = {};
    let re = /^config\./;

    if (re.test(name)) {
      newValue.config = Object.assign(this.state.dataSourceFormValues.config, {
        [name.replace(re, '')]: value,
      });
    }
    else {
      newValue[name] = value;
    }

    let dataSourceFormValues = Object.assign({}, this.state.dataSourceFormValues, newValue);
    this.setState({ dataSourceFormValues });
  }

  handleCloseDataSourceFormModal() {
    this.setState({ dataSourceFormValues: null });
  }

  handleSaveDataSourceFormModal() {
    let dataSourceFormValues = this.state.dataSourceFormValues;
    let dataSources;

    if (dataSourceFormValues.id) {
      // update
      this.db.updateDataSource(dataSourceFormValues).then(() => {
        dataSources = this.state.dataSources.map(c => {
          if (c.id === dataSourceFormValues.id) {
            return Object.assign({}, dataSourceFormValues);
          }
          else {
            return c;
          }
        });
        this.setState({ dataSources });
        this.fetchTables(dataSourceFormValues.id);
      }).catch(err => {
        console.error(err);
      });
    }
    else {
      // create
      if (!dataSourceFormValues.name) {
        dataSourceFormValues.name = 'New Database';
      }
      this.db.createDataSource(dataSourceFormValues).then(newDataSource => {
        dataSources = [newDataSource].concat(this.state.dataSources);
        this.setState({ dataSources, selectedDataSourceId: newDataSource.id });
        this.fetchTables(newDataSource.id);
      })
      .catch(err => {
        console.error(err);
      });
    }

    this.setState({ dataSourceFormValues: null });
  }

  handleDeleteDataSource(id) {
    let dataSources = this.state.dataSources.filter(c => c.id !== id);
    this.db.deleteDataSource(id).then(() => {
      this.setState({ dataSources, selectedDataSourceId: null });
    }).catch(err => {
      console.error(err);
    });
  }

  handleExecuteConnectionTest(dataSource) {
    this.setState({ connectionTest: 'working' });
    this.executor(dataSource).connectionTest().then(result => {
      this.setState({ connectionTest: result ? 'success' : 'failure' });
    }).catch(err => {
      console.error(err);
    });
  }

  handleSelectTable(dataSource, table) {
    let tableName = table.table_schema ? `${table.table_schema}.${table.table_name}` : table.table_name;

    this.updateDataSource(dataSource, { selectedTable: tableName, tableSummary: null });
    this.executor(dataSource).fetchTableSummary(tableName).then(tableSummary => {
      this.updateDataSource(dataSource, { selectedTable: tableName, tableSummary });
    }).catch(err => {
      console.error(err);
    });
  }

  handleChangeTableFilterValue(dataSource, value) {
    dataSource.tableFilterValue = value;
    this.setState({ dataSources: this.state.dataSources });
  }

  fetchTables(id) {
    let dataSource = _.find(this.state.dataSources, { id });
    dataSource.tables = null;
    this.setState({ dataSources: this.state.dataSources });

    this.executor(dataSource).fetchTables().then(res => {
      dataSource.tables = res.rows;
      this.setState({ dataSources: this.state.dataSources });
    }).catch(err => {
      console.error(err);
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
    if (!this.state.initialize) {
      return <div>Loading...</div>;
    }

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
