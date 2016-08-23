import React from 'react';
import Container from 'react-micro-container';
import mysql from 'mysql';
import SQLEditor from '../components/sql_editor/sql_editor';
import ResultTable from '../components/result_table/result_table';

export default class MainContainer extends Container {
  constructor() {
    super();

    this.state = {
      sql: localStorage.getItem('sql') || '',
      rows: [],
      fields: [],
    };

    this.connectino = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'isucon',
    });
  }

  componentDidMount() {
    this.subscribe({
      execute: this.handleExecute,
      changeSql: this.handleChangeSql,
    });
  }

  handleChangeSql(sql) {
    this.setState({ sql });
  }

  handleExecute() {
    localStorage.setItem('sql', this.state.sql);
    this.connectino.query(this.state.sql, (err, rows, fields) => {
      if (err) console.error(err);
      this.setState({ rows, fields });
    });
  }

  render() {
    return (
      <div className="MainContainer">
        <SQLEditor dispatch={this.dispatch} {...this.state} />
        <ResultTable dispatch={this.dispatch} {...this.state} />
      </div>
    );
  }
}
