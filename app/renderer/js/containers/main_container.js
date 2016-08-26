import React from 'react';
import Container from 'react-micro-container';
import _ from 'lodash';
import SQLEditor from '../components/sql_editor/sql_editor';
import ResultTable from '../components/result_table/result_table';
import ConnectionSelect from '../components/connection_select/connection_select';
import Executor from '../services/executor';

export default class MainContainer extends Container {
  constructor() {
    super();

    this.state = {
      sql: localStorage.getItem('sql') || '',
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
    };
  }

  componentDidMount() {
    this.subscribe({
      execute: this.handleExecute,
      changeSql: this.handleChangeSql,
      changeConnection: this.handleChangeConnection,
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

  render() {
    return (
      <div className="layout-app">
        <div className="layout-app-column1">
        </div>
        <div className="layout-app-column2">
          <ConnectionSelect dispatch={this.dispatch} {...this.state} />
          <SQLEditor dispatch={this.dispatch} {...this.state} />
          <ResultTable dispatch={this.dispatch} {...this.state} />
        </div>
      </div>
    );
  }
}
