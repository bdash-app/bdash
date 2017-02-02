import { setting } from '../../../lib/Setting';
import GitHubApiClient from '../../../lib/GitHubApiClient';
import { dispatch } from './SettingStore';

const SettingAction = {
  initialize() {
    dispatch('initialize', { setting: setting.load() });
  },

  update(params) {
    setting.save(params);
    dispatch('update', { setting: params });
  },

  validateGithubToken({ url, token }) {
    dispatch('githubValidateTokenWorking');

    new GitHubApiClient({ url, token }).validateToken().then(() => {
      dispatch('githubValidateTokenSuccess');
    }).catch(err => {
      dispatch('githubValidateTokenError', { message: err.message });
    });
  },
};

export default SettingAction;
