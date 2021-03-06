import React from "react";
import CodeMirror from "codemirror";
import "codemirror/addon/comment/comment";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/search/search";
import "codemirror/addon/runmode/colorize";
import "codemirror/keymap/vim";
import "codemirror/mode/sql/sql";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/hint/show-hint.css";
import { isEqual } from "lodash";
import { clipboard } from "electron";

type Props = {
  readonly options: CodeMirror.EditorConfiguration;
  readonly tables: string[];
  readonly value: string;
  readonly codeMirrorHistory?: Record<string, unknown>;
  readonly rootRef: React.Ref<any>;
  readonly onSubmit: () => void;
  readonly onChange: (change: string, codeMirrorHistory: Record<string, unknown>) => void;
  readonly onChangeCursor: (lineNumber: number) => void;
};

export default class Editor extends React.Component<Props> {
  codeMirror: CodeMirror.EditorFromTextArea;
  currentValue: string;
  currentOptions: CodeMirror.EditorConfiguration;
  textareaElement: HTMLTextAreaElement | null;
  ignoreTriggerChangeEvent = false;
  autoCompleteTimer: number;

  componentDidMount(): void {
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
    if (process.platform === "darwin") {
      this.codeMirror.addKeyMap({
        ["Ctrl-K"]: (cm: CodeMirror.Editor) => {
          if (!cm.somethingSelected()) {
            const cursor = cm.getCursor();
            const line = cm.getLine(cursor.line);
            if (cursor.ch === line.length) {
              cm.setSelection(cursor, { line: cursor.line + 1, ch: 0 });
            } else {
              cm.setSelection(cursor, { line: cursor.line, ch: line.length });
            }
          }
          clipboard.writeFindText(cm.getSelection());
          cm.replaceSelection("");
        },
        ["Ctrl-Y"]: cm => {
          const killBuffer = clipboard.readFindText();
          if (killBuffer.length > 0) {
            cm.replaceSelection(killBuffer);
          }
        }
      });
    }
    this.currentValue = this.props.value;
    this.currentOptions = this.props.options;
    this.codeMirror.setValue(this.currentValue);
    if (this.props.codeMirrorHistory) {
      this.codeMirror.setHistory(this.props.codeMirrorHistory);
    } else {
      this.codeMirror.clearHistory();
    }
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

  componentWillUnmount(): void {
    // todo: is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (this.currentValue !== nextProps.value) {
      this.ignoreTriggerChangeEvent = true;
      this.codeMirror.setValue(nextProps.value);
      if (nextProps.codeMirrorHistory) {
        this.codeMirror.setHistory(nextProps.codeMirrorHistory);
      } else {
        this.codeMirror.clearHistory();
      }
      this.ignoreTriggerChangeEvent = false;
    }

    if (typeof nextProps.options === "object" && !isEqual(nextProps.options, this.currentOptions)) {
      this.currentOptions = nextProps.options;
      Object.entries(nextProps.options).forEach(([optionName, optionValue]) => {
        this.codeMirror.setOption(optionName as keyof CodeMirror.EditorConfiguration, optionValue);
      });
    }
  }

  handleValueChange(editor: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList): void {
    const newValue = editor.getValue();
    this.currentValue = newValue;

    if (this.ignoreTriggerChangeEvent === false) {
      this.props.onChange && this.props.onChange(newValue, editor.getHistory());
    }

    if (this.autoCompleteTimer) {
      clearTimeout(this.autoCompleteTimer);
    }
    this.autoCompleteTimer = window.setTimeout(() => {
      // Skip auto completion if event is caused by auto complete or create/change query
      if (changeObj.origin === "complete" || changeObj.origin === "setValue") {
        return;
      }
      const cursor = editor.getCursor();
      const token = editor.getTokenAt(cursor);
      const tokenString = token.string;
      CodeMirror.showHint(editor, undefined, {
        hint: (): CodeMirror.Hints => {
          return {
            from: CodeMirror.Pos(cursor.line, token.start),
            to: CodeMirror.Pos(cursor.line, token.end),
            list:
              tokenString.length === 0
                ? []
                : this.props.tables.filter(t => t.length > tokenString.length && t.startsWith(tokenString))
          };
        },
        completeSingle: false
      });
    }, 400);
  }

  handleCursorChange(editor: CodeMirror.Editor): void {
    const cursor = editor.getCursor();
    const line = (cursor.line || 0) + 1;
    this.props.onChangeCursor(line);
  }

  render(): React.ReactNode {
    return (
      <div className="Editor" ref={this.props.rootRef}>
        <textarea
          ref={(node): void => {
            this.textareaElement = node;
          }}
          defaultValue=""
          autoComplete="off"
        />
      </div>
    );
  }
}
