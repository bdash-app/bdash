import React from 'react';
import CodeMirror from './codemirror';
import 'codemirror/addon/runmode/colorize';
import 'codemirror/mode/sql/sql';
import Button from '../button/button';

export default class SQLEditor extends React.Component {
  handleChange(sql) {
    this.props.dispatch('changeSql', this.props.query, sql);
  }

  handleSubmit() {
    this.props.dispatch('execute', this.props.query);
  }

  render() {
    let query = this.props.query;

    return (
      <div className="SQLEditor">
        <CodeMirror
          value={query.sql || ''}
          onChange={this.handleChange.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
          options={{ mode: 'text/x-sql', theme: 'neat', lineNumbers: true }} />
        <div className="SQLEditor-ctrl">
          <Button label="Execute" onClick={this.handleSubmit.bind(this)} />
          <span><i className="fa fa-check"></i></span>
          <span>runtime: {query.runtime ? `${query.runtime}ms` : '-'}</span>
          <span>rows: {query.rows ? query.rows.length : '-'}</span>
        </div>
      </div>
    );
  }
}
