import React from "react";
import Select, { OptionTypeBase } from "react-select";
import Container from "../../flux/Container";
import { store, SettingState } from "./SettingStore";
import Action from "./SettingAction";
import Button from "../../components/Button";
import ProgressIcon from "../../components/ProgressIcon";
import { selectStyles } from "../../components/Select";

class Setting extends React.Component<{}, SettingState> {
  componentDidMount(): void {
    Action.initialize();
  }

  renderGithubValidateTokenResult(): React.ReactNode {
    const { status, error } = this.state.githubValidateToken;
    return status === null ? null : <ProgressIcon status={status} message={error} />;
  }

  render(): React.ReactNode {
    const keyBindOptions: { value: string; label: string }[] = ["default", "vim"].map(v => ({ value: v, label: v }));
    const setting = this.state.setting;
    const currentOption = keyBindOptions.find(option => option.value === (setting.keyBind || "default"));
    const github = setting.github || {};

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
        </div>

        <div className="page-Setting-section1">
          <h1>GitHub Access Token</h1>
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
          <div className="page-Setting-validateToken">
            <Button
              onClick={(): void => {
                Action.validateGithubToken(github);
              }}
            >
              Validate Token
            </Button>
            {this.renderGithubValidateTokenResult()}
          </div>
        </div>
      </div>
    );
  }
}

export default Container.create<SettingState>(Setting, store);
