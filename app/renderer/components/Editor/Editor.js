import React from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/addon/search/search';
import 'codemirror/addon/runmode/colorize';
import 'codemirror/keymap/vim';
import 'codemirror/mode/sql/sql';
import { isEqual } from 'lodash';

export default class Editor extends React.Component {
  componentDidMount() {
    let textareaNode = this.refs.textarea;
    this.codeMirror = CodeMirror.fromTextArea(textareaNode, this.props.options);
    this.codeMirror.on('change', this.handleValueChange.bind(this));
    this.codeMirror.on('cursorActivity', this.handleCursorChange.bind(this));
    this.codeMirror.setOption('extraKeys', {
      [process.platform === 'darwin' ? 'Cmd-Enter' : 'Alt-Enter']: () => {
        this.props.onSubmit();
      },
      'Tab': cm => {
        if (!cm.state.vim || cm.state.vim.insertMode) {
          cm.execCommand('insertSoftTab');
        }
      },
    });
    this.currentValue = this.props.value || '';
    this.currentOptions = this.props.options || {};
    this.codeMirror.setValue(this.currentValue);
    CodeMirror.Vim.defineAction('indent', cm => cm.indentLine(cm.getCursor().line, 'add'));
    CodeMirror.Vim.defineAction('unindent', cm => cm.indentLine(cm.getCursor().line, 'subtract'));
    CodeMirror.Vim.defineAction('delLineLeft', cm => cm.execCommand('delLineLeft'));
    CodeMirror.Vim._mapCommand({ keys: '<C-t>', type: 'action', action: 'indent', context: 'insert' });
    CodeMirror.Vim._mapCommand({ keys: '<C-d>', type: 'action', action: 'unindent', context: 'insert' });
    CodeMirror.Vim._mapCommand({ keys: '<C-u>', type: 'action', action: 'delLineLeft', context: 'insert' });
  }

  componentWillUnmount() {
    // todo: is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== undefined && this.currentValue !== nextProps.value) {
      this.codeMirror.setValue(nextProps.value);
    }

    if (typeof nextProps.options === 'object' && !isEqual(nextProps.options, this.currentOptions)) {
      this.currentOptions = nextProps.options;
      for (let optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, nextProps.options[optionName]);
        }
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.height !== nextProps.height;
  }

  handleValueChange(doc) {
    let newValue = doc.getValue();
    this.currentValue = newValue;
    this.props.onChange && this.props.onChange(newValue);
  }

  handleCursorChange(doc) {
    let cursor = doc.getCursor();
    let line = (cursor.line || 0) + 1;
    this.props.onChangeCursor(line);
  }

  render() {
    let height = this.props.height;
    return <div className="Editor" style={height != null ? { height: `${height}px` } : {}}>
      <textarea ref="textarea" defaultValue="" autoComplete="off" />
    </div>;
  }
}
