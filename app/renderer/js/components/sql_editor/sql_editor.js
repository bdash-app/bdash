import React from 'react';
import CodeMirror from './codemirror';
import 'codemirror/addon/runmode/colorize';
import 'codemirror/mode/sql/sql';
import Button from '../button/button';

export default class SQLEditor extends React.Component {
  handleChange(body) {
    this.props.dispatch('changeQueryBody', this.props.query, body);
  }

  handleChangeCursor(line) {
    this.props.dispatch('changeEditorCursor', line);
  }

  handleSubmit() {
    this.props.dispatch('execute', this.props.query);
  }

  renderStatus() {
    switch (this.props.query.status) {
    case 'success': return this.renderSuccess();
    case 'failure': return this.renderError();
    case 'working': return this.renderWorking();
    default: return null;
    }
  }

  renderSuccess() {
    let query = this.props.query;
    return (
      <div className="SQLEditor-status">
        <span><i className="fa fa-check"></i></span>
        <span>runtime: {query.runtime ? `${query.runtime}ms` : '-'}</span>
        <span>rows: {query.rows ? query.rows.length : '-'}</span>
      </div>
    );
  }

  renderError() {
    return (
      <div className="SQLEditor-status is-error">
        <span><i className="fa fa-close"></i> Failed</span>
      </div>
    );
  }

  renderWorking() {
    return (
      <div className="SQLEditor-status is-working">
        <span><i className="fa fa-spin fa-refresh"></i></span>
      </div>
    );
  }

  get codeMirrorOptions() {
    return {
      mode: 'text/x-sql',
      keyMap: this.props.setting.keyBind,
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      smartIndent: false,
    };
  }

  render() {
    let query = this.props.query;

    return (
      <div className="SQLEditor">
        <CodeMirror
          value={query.body || ''}
          onChange={this.handleChange.bind(this)}
          onChangeCursor={this.handleChangeCursor.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
          options={this.codeMirrorOptions} />
        <div className="SQLEditor-ctrl">
          <Button label="Execute" onClick={this.handleSubmit.bind(this)} />
          {this.renderStatus()}
        </div>
      </div>
    );
  }
}
