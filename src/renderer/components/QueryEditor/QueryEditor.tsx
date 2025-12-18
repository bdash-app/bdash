import React from "react";
import Button from "../Button";
import Editor from "../Editor";
import { SettingType } from "../../../lib/Setting";
import { EditorConfiguration } from "codemirror";
import { QueryType } from "../../../lib/Database/Query";
import { TableType } from "src/renderer/pages/DataSource/DataSourceStore";
import { Language } from "@hokaccha/sql-formatter";

type Props = {
  readonly setting: SettingType;
  readonly query: QueryType;
  readonly tables: TableType[];
  readonly mimeType: string;
  readonly formatType: Language;
  readonly onCancel: () => void;
  readonly onExecute: () => void;
  readonly onChangeQueryBody: (body: string, codeMirrorHistory: Record<string, unknown>) => void;
  readonly onChangeCursorPosition: (lineNumber: number) => void;
};

const QueryEditor: React.FC<Props> = ({
  setting,
  query,
  tables,
  mimeType,
  formatType,
  onCancel,
  onExecute,
  onChangeQueryBody,
  onChangeCursorPosition,
}) => {
  const editorElementRef = React.useRef<HTMLDivElement>(null);

  const [cmTheme, setCmTheme] = React.useState<string>(
    document.body.classList.contains("theme-dark") ? "midnight" : "default"
  );

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.body.classList.contains("theme-dark");
      const newTheme = isDark ? "midnight" : "default";
      // Only update if the theme actually changed
      setCmTheme((currentTheme) => (currentTheme !== newTheme ? newTheme : currentTheme));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const options = React.useMemo((): EditorConfiguration => {
    return {
      mode: mimeType,
      keyMap: setting.keyBind,
      lineNumbers: true,
      lineWrapping: setting.lineWrap,
      matchBrackets: true,
      indentUnit: setting.indent,
      smartIndent: false,
      autoRefresh: { delay: 50 },
      theme: cmTheme,
    };
  }, [mimeType, setting.indent, setting.keyBind, setting.lineWrap, cmTheme]);

  const renderButton = (): React.ReactNode => {
    if (query.status === "working") {
      return (
        <Button className="QueryEditor-cancelBtn" onClick={onCancel}>
          Cancel
        </Button>
      );
    } else {
      return (
        <Button className="QueryEditor-executeBtn" onClick={onExecute}>
          Execute
        </Button>
      );
    }
  };

  const renderStatus = (): React.ReactNode => {
    switch (query.status) {
      case "success":
        return renderSuccess();
      case "failure":
        return renderError();
      case "working":
        return renderWorking();
      default:
        return null;
    }
  };

  const renderSuccess = (): React.ReactNode => {
    return (
      <div className="QueryEditor-status">
        <span>
          <i className="fas fa-check" />
        </span>
        <span>execute: {query.runAt?.format("YYYY/MM/DD HH:mm:ss") ?? "-"}</span>
        <span>runtime: {query.runtime ? `${query.runtime}ms` : "-"}</span>
        <span>rows: {query.rows ? query.rows.length : "-"}</span>
      </div>
    );
  };

  const renderError = (): React.ReactNode => {
    return (
      <div className="QueryEditor-status is-error">
        <span>
          <i className="fas fa-times" /> Failed
        </span>
      </div>
    );
  };

  const renderWorking = (): React.ReactNode => {
    return (
      <div className="QueryEditor-status is-working">
        <span>
          <i className="fas fa-spin fa-sync" />
        </span>
      </div>
    );
  };

  const tableNames: string[] = tables.map((table) => table.name);

  return (
    <div className="QueryEditor">
      <Editor
        value={query.body || ""}
        tables={tableNames}
        formatType={formatType}
        rootRef={editorElementRef}
        onChange={onChangeQueryBody}
        onChangeCursor={onChangeCursorPosition}
        onSubmit={onExecute}
        options={options}
        codeMirrorHistory={query.codeMirrorHistory ?? undefined}
        setting={setting}
      />
      <div className="QueryEditor-navbar">
        {renderButton()}
        {renderStatus()}
      </div>
    </div>
  );
};

export default QueryEditor;
