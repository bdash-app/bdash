import React from 'react';
import Select from 'react-select';
import Container from '../../flux/Container';
import { store } from './SettingStore';
import SettingAction from './SettingAction';
import Button from '../../components/Button';

export default class Setting extends Container {
  get store() {
    return store;
  }

  componentDidMount() {
    SettingAction.initialize();
  }

  renderGithubVlidateTokenResult() {
    if (this.state.githubValidateTokenSuccess) {
      return <span className="SettingPanel-githubTokenOk"><i className="fa fa-check" /></span>;
    }
    else if (this.state.githubValidateTokenError) {
      return <span className="SettingPanel-githubTokenError">{this.state.githubValidateTokenError}</span>;
    }

    return null;
  }

  render() {
    let keyBindOptions = ['default', 'vim'].map(v => ({ value: v, label: v }));
    let setting = this.state.setting;
    let github = setting.github || {};

    return <div className="page-Setting">
      <div className="page-Setting-section1">
        <h1>Editor</h1>
        <div className="page-Setting-section2 page-Setting-keyBind">
          <h2>Key bind</h2>
          <Select
            value={setting.keyBind || 'default'}
            options={keyBindOptions}
            onChange={e => SettingAction.update({ keyBind: e.value })}
            clearable={false}
            />
        </div>
      </div>

      <div className="page-Setting-section1">
        <h1>GitHub Access Token</h1>
        <div className="page-Setting-section2">
          <h2>Access Token (Required scope is only gist)</h2>
          <input type="text" onChange={e => this.handleGithubToken(e)} value={github.token} />
        </div>
        <div className="page-Setting-section2">
          <h2>GitHub Enterprise URL (optional)</h2>
          <input type="text" onChange={e => this.handleGithubUrl(e)} value={github.url} placeholder="https://yourdomain/api/v3" />
        </div>
        <div className="page-Setting-validateToken">
          <Button onClick={() => this.handleGithubValidateToken()}>Validate Token</Button>
          {this.renderGithubVlidateTokenResult()}
        </div>
      </div>
    </div>;
  }
}
