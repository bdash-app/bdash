import React from 'react';
import Select from 'react-select';
import Container from '../../flux/Container';
import { store } from './SettingStore';
import Action from './SettingAction';
import Button from '../../components/Button';
import ProgressIcon from '../../components/ProgressIcon';

class Setting extends React.Component {
  componentDidMount() {
    Action.initialize();
  }

  renderGithubValidateTokenResult() {
    let { status, error } = this.state.githubValidateToken;
    return (status === null) ? null : <ProgressIcon status={status} message={error} />;
  }

  render() {
    let keyBindOptions = ['default', 'vim'].map(v => ({ value: v, label: v }));
    let setting = this.state.setting;
    let github = setting.github || {};
    let bdashServer = setting.bdashServer || {};

    return <div className="page-Setting">
      <div className="page-Setting-section1">
        <h1>Editor</h1>
        <div className="page-Setting-section2 page-Setting-keyBind">
          <h2>Key bind</h2>
          <Select
            value={setting.keyBind || 'default'}
            options={keyBindOptions}
            onChange={e => Action.update({ keyBind: e.value })}
            clearable={false}
            />
        </div>
      </div>

      <div className="page-Setting-section1">
        <h1>GitHub Access Token</h1>
        <div className="page-Setting-section2">
          <h2>Access Token (Required scope is only gist)</h2>
          <input type="text" onChange={e => Action.update({ github: { token: e.target.value } })} value={github.token} />
        </div>
        <div className="page-Setting-section2">
          <h2>GitHub Enterprise URL (optional)</h2>
          <input type="text" onChange={e => Action.update({ github: { url: e.target.value } })} value={github.url} placeholder="https://yourdomain/api/v3" />
        </div>
        <div className="page-Setting-validateToken">
          <Button onClick={() => Action.validateGithubToken(github)}>Validate Token</Button>
          {this.renderGithubValidateTokenResult()}
        </div>
      </div>

      <div className="page-Setting-section1">
        <h1>Bdash Server Setting</h1>
        <div className="page-Setting-section2">
          <h2>Endpoint</h2>
          <input type="text" onChange={e => Action.update({ bdashServer: { endpoint: e.target.value } })} value={bdashServer.endpoint} />
          <h2>Token</h2>
          <input type="text" onChange={e => Action.update({ bdashServer: { token: e.target.value } })} value={bdashServer.token} />
        </div>
      </div>
    </div>;
  }
}

export default Container.create(Setting, store);
