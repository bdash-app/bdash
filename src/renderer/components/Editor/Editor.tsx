import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as CodeMirror from 'codemirror';
import 'codemirror/addon/search/search';
import 'codemirror/addon/runmode/colorize';
import 'codemirror/keymap/vim';
import 'codemirror/mode/sql/sql';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog.css';
import { isEqual } from 'lodash';

export default class Editor extends React.Component<any, any> {
  codeMirror: CodeMirror.EditorFromTextArea;
  currentValue: any;
  currentOptions: any;

  componentDidMount() {
    let textareaNode = ReactDOM.findDOMNode(this.refs.textarea) as HTMLTextAreaElement;
    this.codeMirror = CodeMirror.fromTextArea(textareaNode, this.props.options);
    this.codeMirror.on('change', this.handleValueChange.bind(this));
    this.codeMirror.on('cursorActivity', this.handleCursorChange.bind(this));
    this.codeMirror.setOption('extraKeys', {
      [process.platform === 'darwin' ? 'Cmd-Enter' : 'Alt-Enter']: () => {
        this.props.onSubmit();
      },
      [process.platform === 'darwin' ? 'Cmd-A' : 'Ctrl-A']: () => {
        this.codeMirror.execCommand('selectAll');
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
    CodeMirror.Vim.defineAction('delLineLeft', cm => cm.execCommand('delLineLeft'));
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
