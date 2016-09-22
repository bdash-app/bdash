import React from 'react';
import Container from 'react-micro-container';
import _ from 'lodash';
import GlobalMenu from '../components/global_menu/global_menu';
import QueryPanel from '../components/query_panel/query_panel';
import ConnectionPanel from '../components/connection_panel/connection_panel';
import HistoryPanel from '../components/history_panel/history_panel';
import SettingPanel from '../components/setting_panel/setting_panel';
import Executor from '../services/executor';

export default class AppContainer extends Container {
  constructor() {
    super();

    let state = JSON.parse(localStorage.getItem('state') || '{}');

    this.state = Object.assign({
      queries: [],
      connections: [
        {
          id: 1,
          name: 'MySQL local',
          type: 'mysql',
          host: 'localhost',
          user: 'root',
          password: '',
          database: 'isucon',
        },
        {
          id: 2,
          name: 'Adventar local',
          type: 'postgres',
          host: 'localhost',
          user: 'hokamura',
          password: '',
          database: 'adventar_dev',
        },
      ],
      selectedGlobalMenu: 'query',
    }, state);
  }

  update(state) {
    this.setState(state, () => {
      localStorage.setItem('state', JSON.stringify(this.state));
    });
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
    this.update({ queries });
  }

  componentDidMount() {
    this.subscribe({
      execute: this.handleExecute,
      changeSql: this.handleChangeSql,
      changeTitle: this.handleChangeTitle,
      changeConnection: this.handleChangeConnection,
      selectGlobalMenu: this.handleSelectGlobalMenu,
      addNewQuery: this.handleAddNewQuery,
      selectQuery: this.handleSelectQuery,
      updateChart: this.handleUpdateChart,
    });
  }

  handleChangeSql(query, sql) {
    this.updateQuery(query, { sql });
  }

  handleExecute(query) {
    let connection = _.find(this.state.connections, { id: query.connectionId });
    let { type } = connection;
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
    let id = this.state.queries.length + 2;
    let newQuery = { id: id, title: 'New Query', connectionId: 1 };
    this.update({
      queries: [newQuery].concat(this.state.queries),
      selectedQueryId: id,
    });
  }

  handleSelectQuery(id) {
    this.update({ selectedQueryId: id });
  }

  handleUpdateChart(query, chartParams) {
    let chart = Object.assign({}, query.chart, chartParams);
    this.updateQuery(query, { chart });
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
