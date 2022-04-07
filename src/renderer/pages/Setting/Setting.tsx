import React from "react";
import Select, { OptionTypeBase } from "react-select";
import Container from "../../flux/Container";
import { store, SettingState } from "./SettingStore";
import Action from "./SettingAction";
import Button from "../../components/Button";
import ProgressIcon from "../../components/ProgressIcon";
import { selectStyles } from "../../components/Select";
import { indentValues } from "../../../lib/Setting";

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
    const setting = this.state.setting;
    const currentOption = keyBindOptions.find((option) => option.value === (setting.keyBind || "default"));
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
          <h1>Editor</h1>
          <div className="page-Setting-section2 page-Setting-keyBind">
            <h2>Key bind</h2>
            <Select
              value={currentOption}
              options={keyBindOptions}
              onChange={(e): void => Action.update({ keyBind: (e as OptionTypeBase).value })}
              isClearable={false}
              isSearchable={false}
              styles={selectStyles}
            />
          </div>
          <div className="page-Setting-section2 page-Setting-lineWrap">
            <h2>Line wrap</h2>
            <input
              type="checkbox"
              onChange={(e): void => Action.update({ lineWrap: e.target.checked })}
              checked={setting.lineWrap}
            />
          </div>
          <div className="page-Setting-section2 page-Setting-lineWrap">
            <h2>Indent</h2>
            <Select
              value={{ value: setting.indent, label: setting.indent }}
              options={indentValues.map((v) => ({ value: v, label: v }))}
              onChange={(e): void => Action.update({ indent: (e as OptionTypeBase).value })}
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
              onChange={(e): void => Action.update({ formatter: { keywordCase: (e as OptionTypeBase).value } })}
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
              onChange={(e): void => Action.update({ github: { token: e.target.value } })}
              value={github.token || ""}
            />
          </div>
          <div className="page-Setting-section2">
            <h2>GitHub Enterprise URL (optional)</h2>
            <input
              type="text"
              onChange={(e): void => Action.update({ github: { url: e.target.value } })}
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
              onChange={(e): void => Action.update({ github: { public: e.target.checked } })}
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
              onChange={(e): void => Action.update({ github: { maximumNumberOfRowsOfGist: Number(e.target.value) } })}
            />
          </div>
        </div>
        <div className="page-Setting-section1">
          <h1>Bdash Server Settings</h1>
          <div className="page-Setting-section2">
            <h2>Access Token</h2>
            <input
              type="text"
              onChange={(e): void => Action.update({ bdashServer: { token: e.target.value } })}
              value={bdashServer.token || ""}
            />
          </div>
          <div className="page-Setting-section2">
            <h2>Bdash Server URL</h2>
            <input
              type="text"
              onChange={(e): void => Action.update({ bdashServer: { url: e.target.value } })}
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
              onChange={(e): void => Action.update({ bdashServer: { maximumNumberOfRows: Number(e.target.value) } })}
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
                onChange={(e): void =>
                  Action.update({ experimentalFeature: { autoCompleteEnabled: e.target.checked } })
                }
                checked={setting.experimentalFeature.autoCompleteEnabled}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default Container.create<SettingState>(Setting, store);
