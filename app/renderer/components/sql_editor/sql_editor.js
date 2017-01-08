import React from 'react';
import ReactDOM from 'react-dom';
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

  handleCancel() {
    this.props.dispatch('cancelQuery', this.props.query);
  }

  handleSubmit() {
    this.props.dispatch('execute', this.props.query);
  }

  renderButton() {
    if (this.props.query.status === 'working') {
      return <Button label="Cancel" onClick={this.handleCancel.bind(this)} />;
    }
    else {
      return <Button label="Execute" onClick={this.handleSubmit.bind(this)} />;
    }
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

  handleResizeStart(e) {
    e.preventDefault();
    let dom = ReactDOM.findDOMNode(this);
    let height = dom.clientHeight;
    let y = e.pageY;
    let handleResize = (e) => {
      let newHeight = height + (e.pageY - y);
      if (newHeight < 46) newHeight = 46;
      this.props.dispatch('changeEditorHeight', newHeight);
    };
    let handleResizeStop = () => {
      document.removeEventListener('mouseup', handleResizeStop);
      document.removeEventListener('mousemove', handleResize);
    };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeStop);
  }

  getStyle() {
    return this.props.editorHeight == null ? {} : {
      height: `${this.props.editorHeight}px`,
    };
  }

  render() {
    let query = this.props.query;

    return (
      <div className="SQLEditor" style={this.getStyle()}>
        <CodeMirror
          value={query.body || ''}
          onChange={this.handleChange.bind(this)}
          onChangeCursor={this.handleChangeCursor.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
          options={this.codeMirrorOptions} />
        <div className="SQLEditor-ctrl">
          {this.renderButton()}
          {this.renderStatus()}
          <span onMouseDown={this.handleResizeStart.bind(this)} className="SQLEditor-resize">
            <i className="fa fa-arrows-v" />
          </span>
        </div>
      </div>
    );
  }
}
