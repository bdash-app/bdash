import React from 'react';
import CodeMirror from './codemirror';
import 'codemirror/addon/runmode/colorize';
import 'codemirror/mode/sql/sql';
import Button from '../button/button';

export default class SQLEditor extends React.Component {
  handleChange(sql) {
    this.props.dispatch('changeSql', sql);
  }

  handleSubmit() {
    this.props.dispatch('execute');
  }

  render() {
    return (
      <div className="SQLEditor">
        <CodeMirror
          value={this.props.sql}
          onChange={this.handleChange.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
          options={{ mode: 'text/x-sql', theme: 'neat', lineNumbers: true }} />
        <div className="SQLEditor-ctrl">
          <Button label="Execute" onClick={this.handleSubmit.bind(this)} />
        </div>
      </div>
    );
  }
}
