import React from "react";
import CodeMirror from "codemirror";
import "codemirror/addon/comment/comment";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/search/search";
import "codemirror/addon/runmode/colorize";
import "codemirror/keymap/vim";
import "codemirror/mode/sql/sql";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/dialog/dialog.css";
import { isEqual } from "lodash";

type Props = {
  readonly options: CodeMirror.EditorConfiguration;
  readonly value: string;
  readonly rootRef: React.Ref<any>;
  readonly onSubmit: () => void;
  readonly onChange: (change: string) => void;
  readonly onChangeCursor: (lineNumber: number) => void;
};

export default class Editor extends React.Component<Props> {
  codeMirror: CodeMirror.EditorFromTextArea;
  currentValue: string;
  currentOptions: CodeMirror.EditorConfiguration;
  textareaElement: HTMLTextAreaElement | null;

  componentDidMount() {
    if (this.textareaElement === null) {
      return;
    }

    this.codeMirror = CodeMirror.fromTextArea(this.textareaElement, this.props.options);
    this.codeMirror.on("change", this.handleValueChange.bind(this));
    this.codeMirror.on("focus", () => {
      this.codeMirror.refresh();
    });
    this.codeMirror.on("cursorActivity", this.handleCursorChange.bind(this));
    this.codeMirror.setOption("extraKeys", {
      [process.platform === "darwin" ? "Cmd-Enter" : "Alt-Enter"]: () => {
        this.props.onSubmit();
      },
      [process.platform === "darwin" ? "Cmd-A" : "Ctrl-A"]: () => {
        this.codeMirror.execCommand("selectAll");
      },
      [process.platform === "darwin" ? "Cmd-/" : "Ctrl-/"]: () => {
        this.codeMirror.execCommand("toggleComment");
      },
      Tab: (cm: CodeMirror.Editor) => {
        if (!cm.state.vim) {
          if (cm.getDoc().somethingSelected()) cm.execCommand("indentMore");
          else cm.execCommand("insertSoftTab");
        } else if (cm.state.vim.insertMode) {
          cm.execCommand("insertSoftTab");
        }
      }
    });
    this.currentValue = this.props.value;
    this.currentOptions = this.props.options;
    this.codeMirror.setValue(this.currentValue);
    CodeMirror.Vim.defineAction("delLineLeft", cm => cm.execCommand("delLineLeft"));
    CodeMirror.Vim._mapCommand({
      keys: "<C-u>",
      type: "action",
      action: "delLineLeft",
      context: "insert"
    });
    if (process.platform !== "darwin") {
      const vim: any = CodeMirror.Vim;
      if (typeof vim.findKey(this.codeMirror, "<C-c>") === "function") {
        vim.unmap("<C-c>");
      }
    }
  }

  componentWillUnmount() {
    // todo: is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.currentValue !== nextProps.value) {
      this.codeMirror.setValue(nextProps.value);
    }

    if (typeof nextProps.options === "object" && !isEqual(nextProps.options, this.currentOptions)) {
      this.currentOptions = nextProps.options;
      Object.entries(nextProps.options).forEach(([optionName, optionValue]) => {
        this.codeMirror.setOption(optionName as keyof CodeMirror.EditorConfiguration, optionValue);
      });
    }
  }

  handleValueChange(doc: CodeMirror.Doc) {
    const newValue = doc.getValue();
    this.currentValue = newValue;
    this.props.onChange && this.props.onChange(newValue);
  }

  handleCursorChange(doc: CodeMirror.Doc) {
    const cursor = doc.getCursor();
    const line = (cursor.line || 0) + 1;
    this.props.onChangeCursor(line);
  }

  render() {
    return (
      <div className="Editor" ref={this.props.rootRef}>
        <textarea ref={node => (this.textareaElement = node)} defaultValue="" autoComplete="off" />
      </div>
    );
  }
}
