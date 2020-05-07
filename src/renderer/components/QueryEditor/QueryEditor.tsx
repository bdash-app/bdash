import React from "react";
import Button from "../Button";
import Editor from "../Editor";
import { SettingType } from "../../../lib/Setting";
import { EditorConfiguration } from "codemirror";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly editor: { line: number | null };
  readonly setting: SettingType;
  readonly query: QueryType;
  readonly onCancel: () => void;
  readonly onExecute: () => void;
  readonly onChangeEditorHeight: (height: number) => void;
  readonly onChangeQueryBody: (body: string) => void;
  readonly onChangeCursorPosition: (lineNumber: number) => void;
  readonly onChangeQueryHistoryToLatest: () => void;
  readonly onChangeQueryHistory: (queryExecutionId: number) => void;
};

export default class QueryEditor extends React.Component<Props, { queryExecutionId?: number }> {
  editorElement: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.state = { queryExecutionId: undefined };
    this.handleChangeHistory = this.handleChangeHistory.bind(this);
  }

  get options(): EditorConfiguration {
    return {
      mode: "text/x-sql",
      keyMap: this.props.setting.keyBind,
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      smartIndent: false,
      autoRefresh: { delay: 50 }
    };
  }

  handleChangeHistory(e: React.ChangeEvent<HTMLSelectElement>): void {
    const queryExecutionId = Number(e.target.value);
    if (queryExecutionId < 0) {
      this.props.onChangeQueryHistoryToLatest();
    } else {
      this.props.onChangeQueryHistory(queryExecutionId);
    }
  }

  renderButton(): React.ReactNode {
    if (this.props.query.status === "working") {
      return (
        <Button className="QueryEditor-cancelBtn" onClick={this.props.onCancel}>
          Cancel
        </Button>
      );
    } else {
      return (
        <Button className="QueryEditor-executeBtn" onClick={this.props.onExecute}>
          Execute
        </Button>
      );
    }
  }

  renderHistory(): React.ReactNode {
    return (
      <select
        className="QueryEditor-historySelect"
        value={this.props.query.execution ? this.props.query.execution.id : -1}
        onChange={this.handleChangeHistory}
      >
        <option value={-1}>latest</option>
        {this.props.query.histories.map((history, i) => (
          <option key={i} value={history.id}>
            {history.runAt.format("YYYY/MM/DD HH:mm:ss")}
          </option>
        ))}
      </select>
    );
  }

  renderStatus(): React.ReactNode {
    switch (this.props.query.status) {
      case "success":
        return this.renderSuccess();
      case "failure":
        return this.renderError();
      case "working":
        return this.renderWorking();
      default:
        return null;
    }
  }

  renderSuccess(): React.ReactNode {
    const query = this.props.query;
    return (
      <div className="QueryEditor-status">
        <span>
          <i className="fas fa-check" />
        </span>
        <span>execute: {(query.execution?.runAt ?? query.runAt)?.format("YYYY/MM/DD HH:mm:ss") ?? "-"}</span>
        <span>runtime: {query.runtime ? `${query.runtime}ms` : "-"}</span>
        <span>rows: {(query.execution ?? query).rows?.length ?? "-"}</span>
      </div>
    );
  }

  renderError(): React.ReactNode {
    return (
      <div className="QueryEditor-status is-error">
        <span>
          <i className="fas fa-times" /> Failed
        </span>
      </div>
    );
  }

  renderWorking(): React.ReactNode {
    return (
      <div className="QueryEditor-status is-working">
        <span>
          <i className="fas fa-spin fa-sync" />
        </span>
      </div>
    );
  }

  render(): React.ReactNode {
    const query = this.props.query;

    return (
      <div className="QueryEditor">
        <Editor
          value={query.body || ""}
          rootRef={(node): void => (this.editorElement = node)}
          onChange={this.props.onChangeQueryBody}
          onChangeCursor={this.props.onChangeCursorPosition}
          onSubmit={this.props.onExecute}
          options={this.options}
        />
        <div className="QueryEditor-navbar">
          {this.renderButton()}
          {this.renderHistory()}
          {this.renderStatus()}
        </div>
      </div>
    );
  }
}
