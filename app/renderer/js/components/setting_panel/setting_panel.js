import React from 'react';
import Select from 'react-select';
import GitHubApiClient from '../../services/GitHubApiClient';

export default class SettingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      githubValidateTokenSuccess: null,
      githubValidateTokenError: null,
    };
  }

  handleChangeKeyBind(e) {
    this.props.dispatch('updateSetting', { keyBind: e.value });
  }

  handleGithubToken(e) {
    this.props.dispatch('updateSetting', { github: { token: e.target.value } });
  }

  handleGithubUrl(e) {
    this.props.dispatch('updateSetting', { github: { url: e.target.value } });
  }

  handleGithubValidateToken() {
    new GitHubApiClient(this.props.setting.github || {}).validateToken().then(() => {
      this.setState({
        githubValidateTokenSuccess: true,
        githubValidateTokenError: null,
      });
    }).catch(err => {
      this.setState({
        githubValidateTokenSuccess: null,
        githubValidateTokenError: err.message,
      });
    });
  }

  renderGithubVlidateTokenResult() {
    if (this.state.githubValidateTokenSuccess) {
      return <span className="SettingPanel-githubTokenOk"><i className="fa fa-check"></i></span>;
    }
    else if (this.state.githubValidateTokenError) {
      return <span className="SettingPanel-githubTokenError">{this.state.githubValidateTokenError}</span>;
    }

    return null;
  }

  render() {
    let setting = this.props.setting;
    let github = setting.github || {};
    let keyBindOptions = ['default', 'vim'].map(v => ({ value: v, label: v }));

    return (
      <div className="SettingPanel">
        <div className="SettingPanel-item SettingPanel-keyBind">
          <h2>Editor</h2>
          <label>Key bind</label>
          <Select
            value={setting.keyBind || 'default'}
            options={keyBindOptions}
            onChange={(o) => this.handleChangeKeyBind(o)}
            clearable={false}
            />
        </div>
        <div className="SettingPanel-item SettingPanel-github">
          <h2>GitHub Access Token</h2>
          <label>Access Token (Required scope is only gist)</label>
          <input type="text" onChange={e => this.handleGithubToken(e)} value={github.token} />
          <details>
            <summary>GitHub Enterprise Option</summary>
            <label>API Endpoint URL</label>
            <input type="text" onChange={e => this.handleGithubUrl(e)} value={github.url} placeholder="https://yourdomain/api/v3" />
          </details>
          <button onClick={() => this.handleGithubValidateToken()}>Validate Token</button>
          {this.renderGithubVlidateTokenResult()}
        </div>
      </div>
    );
  }
}
