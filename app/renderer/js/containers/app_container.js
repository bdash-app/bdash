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

    this.state = {
      sql: localStorage.getItem('sql') || '',
      queries: [
        { title: 'Query A', id: 4 },
        { title: 'Query B', id: 3 },
        { title: 'Query C', id: 2 },
        { title: 'Long Long Long Long Long Long Long Long Long Long Queryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', id: 1 },
      ],
      rows: [],
      fields: [],
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
      selectedConnectionId: 1,
      selectedGlobalMenu: 'query',
      selectedQueryId: 3,
    };
  }

  componentDidMount() {
    this.subscribe({
      execute: this.handleExecute,
      changeSql: this.handleChangeSql,
      changeConnection: this.handleChangeConnection,
      selectGlobalMenu: this.handleSelectGlobalMenu,
      addNewQuery: this.handleAddNewQuery,
      selectQuery: this.handleSelectQuery,
    });
  }

  handleChangeSql(sql) {
    this.setState({ sql });
  }

  handleExecute() {
    localStorage.setItem('sql', this.state.sql);
    let connection = _.find(this.state.connections, { id: Number(this.state.selectedConnectionId) });
    let { type } = connection;
    Executor.execute(type, this.state.sql, connection).then(([fields, rows]) => {
      this.setState({ fields, rows });
    }).catch(err => {
      console.error(err);
    });
  }

  handleChangeConnection(connectionId) {
    this.setState({ selectedConnectionId: connectionId });
  }

  handleSelectGlobalMenu(name) {
    this.setState({ selectedGlobalMenu: name });
  }

  handleAddNewQuery() {
    let id = this.state.queries.length + 2;
    let newQuery = { id: id, title: 'New Query' };
    this.setState({
      queries: [newQuery].concat(this.state.queries),
      selectedQueryId: id,
    });
  }

  handleSelectQuery(id) {
    this.setState({ selectedQueryId: id });
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
