import React from "react";
import path from "path";
import Select, { OptionTypeBase } from "react-select";
import { clipboard } from "electron";
import Container from "../../flux/Container";
import { store, SettingState } from "./SettingStore";
import Action from "./SettingAction";
import Button from "../../components/Button";
import ProgressIcon from "../../components/ProgressIcon";
import { selectStyles } from "../../components/Select";
import { indentValues, notificationWhenOptions, themeOptions } from "../../../lib/Setting";

export function getMcpServerPath(): string {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    return path.join(__dirname, "..", "..", "..", "src", "mcp", "dist", "server.js");
  }
  return path.join(process.resourcesPath, "mcp", "server.js");
}

function getMcpConfigJson(): string {
  const serverPath = getMcpServerPath();
  const config = {
    mcpServers: {
      bdash: {
        command: "node",
        args: [serverPath],
      },
    },
  };
  return JSON.stringify(config, null, 2);
}

class Setting extends React.Component<unknown, SettingState> {
  override componentDidMount(): void {
    Action.initialize();
  }

  renderGithubValidateTokenResult(): React.ReactNode {
    const { status, error } = this.state.githubValidateToken;
    return status === null ? null : <ProgressIcon status={status} message={error} />;
  }

  renderBdashServerValidateTokenResult(): React.ReactNode {
    const { status, error } = this.state.bdashServerValidateToken;
    return status === null ? null : <ProgressIcon status={status} message={error} />;
  }

  override render(): React.ReactNode {
    const keyBindOptions: { value: string; label: string }[] = ["default", "vim"].map((v) => ({ value: v, label: v }));
    const themeSettingOptions: { value: string; label: string }[] = themeOptions.map((v) => ({ value: v, label: v }));
    const setting = this.state.setting;
    const currentOption = keyBindOptions.find((option) => option.value === (setting.keyBind || "default"));
    const currentThemeOption = themeSettingOptions.find((option) => option.value === (setting.theme || "system"));
    const github = setting.github || {};
    const bdashServer = setting.bdashServer || {};
    const keywordCaseOptions: { value: string; label: string }[] = ["upper", "lower", "preserve"].map((v) => ({
      value: v,
      label: v,
    }));
    const currentKeywordCase = keywordCaseOptions.find((option) => option.value === setting.formatter.keywordCase);

    return (
      <div className="page-Setting">
        <div className="page-Setting-section1">
          <h1>General</h1>
          <div className="page-Setting-section2 page-Setting-theme">
            <h2>Theme</h2>
            <Select
              value={currentThemeOption}
              options={themeSettingOptions}
              onChange={(e) => Action.update({ theme: (e as OptionTypeBase).value })}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          <h1>Editor</h1>
          <div className="page-Setting-section2 page-Setting-keyBind">
            <h2>Key bind</h2>
            <Select
              value={currentOption}
              options={keyBindOptions}
              onChange={(e) => Action.update({ keyBind: (e as OptionTypeBase).value })}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          <div className="page-Setting-section2 page-Setting-lineWrap">
            <h2>Line wrap</h2>
            <input
              type="checkbox"
              onChange={(e) => Action.update({ lineWrap: e.target.checked })}
              checked={setting.lineWrap}
            />
          </div>
          <div className="page-Setting-section2 page-Setting-lineWrap">
            <h2>Indent</h2>
            <Select
              value={{ value: setting.indent, label: setting.indent }}
              options={indentValues.map((v) => ({ value: v, label: v }))}
              onChange={(e) => Action.update({ indent: (e as OptionTypeBase).value })}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
        </div>

        <div className="page-Setting-section1">
          <h1>Formatter</h1>
          <div className="page-Setting-section2 page-Setting-lineWrap">
            <h2>Convert SQL keywords</h2>
            <Select
              value={currentKeywordCase}
              options={keywordCaseOptions}
              onChange={(e) => Action.update({ formatter: { keywordCase: (e as OptionTypeBase).value } })}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
        </div>

        <div className="page-Setting-section1">
          <h1>GitHub Settings</h1>
          <div className="page-Setting-section2">
            <h2>Access Token (Required scope is only gist)</h2>
            <input
              type="text"
              onChange={(e) => Action.update({ github: { token: e.target.value } })}
              value={github.token || ""}
            />
          </div>
          <div className="page-Setting-section2">
            <h2>GitHub Enterprise URL (optional)</h2>
            <input
              type="text"
              onChange={(e) => Action.update({ github: { url: e.target.value } })}
              value={github.url || ""}
              placeholder="https://yourdomain/api/v3"
            />
          </div>
          <div className="page-Setting-validateToken page-Setting-section2">
            <Button
              onClick={(): void => {
                Action.validateGithubToken(github);
              }}
            >
              Validate Token
            </Button>
            {this.renderGithubValidateTokenResult()}
          </div>
          <div className="page-Setting-section2 page-Setting-public">
            <h2>Share on gist in public</h2>
            <input
              type="checkbox"
              onChange={(e) => Action.update({ github: { public: e.target.checked } })}
              checked={setting.github.public}
            />
          </div>
          <div className="page-Setting-section2">
            <h2>Maximum number of rows</h2>
            <input
              type="number"
              max={1000000}
              min={0}
              value={github.maximumNumberOfRowsOfGist}
              onChange={(e) => Action.update({ github: { maximumNumberOfRowsOfGist: Number(e.target.value) } })}
            />
          </div>
        </div>
        <div className="page-Setting-section1">
          <h1>Bdash Server Settings</h1>
          <div className="page-Setting-section2">
            <h2>Access Token</h2>
            <input
              type="text"
              onChange={(e) => Action.update({ bdashServer: { token: e.target.value } })}
              value={bdashServer.token || ""}
            />
          </div>
          <div className="page-Setting-section2">
            <h2>Bdash Server URL</h2>
            <input
              type="text"
              onChange={(e) => Action.update({ bdashServer: { url: e.target.value } })}
              value={bdashServer.url || ""}
              placeholder="https://bdash-server.your-domain.com/"
            />
          </div>
          <div className="page-Setting-validateToken page-Setting-section2">
            <Button
              onClick={(): void => {
                Action.validateBdashServerToken(bdashServer);
              }}
            >
              Validate Token
            </Button>
            {this.renderBdashServerValidateTokenResult()}
          </div>
          <div className="page-Setting-section2">
            <h2>Maximum number of rows</h2>
            <input
              type="number"
              max={1000000}
              min={0}
              value={bdashServer.maximumNumberOfRows}
              onChange={(e) => Action.update({ bdashServer: { maximumNumberOfRows: Number(e.target.value) } })}
            />
          </div>
        </div>
        <div className="page-Setting-section1">
          <h1>Notification</h1>
          <div className="page-Setting-section2">
            <h2>Enable</h2>
            <input
              type="checkbox"
              onChange={(e) => Action.update({ notification: { enabled: e.target.checked } })}
              checked={setting.notification.enabled}
            />
          </div>
          <div className="page-Setting-section2">
            <h2>Notify when</h2>
            <Select
              value={{ value: setting.notification.when, label: setting.notification.when }}
              options={notificationWhenOptions.map((v) => ({ value: v, label: v }))}
              onChange={(e) => Action.update({ notification: { when: (e as OptionTypeBase).value } })}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
        </div>
        <div className="page-Setting-section1">
          <h1>Experimental Features</h1>
          <div className="page-Setting-section2">
            <h2>Auto Complete</h2>
            <label>
              <input
                type="checkbox"
                onChange={(e) => Action.update({ experimentalFeature: { autoCompleteEnabled: e.target.checked } })}
                checked={setting.experimentalFeature.autoCompleteEnabled}
              />
            </label>
          </div>
        </div>
        <div className="page-Setting-section1">
          <h1>MCP Server</h1>
          <div className="page-Setting-section2">
            <h2>Configuration</h2>
            <p className="page-Setting-mcpDescription">Add the following JSON to your MCP client configuration file.</p>
            <pre className="page-Setting-mcpConfig">{getMcpConfigJson()}</pre>
            <Button
              className="page-Setting-mcpCopyButton"
              onClick={(): void => {
                clipboard.writeText(getMcpConfigJson());
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Container.create<SettingState>(Setting, store);
