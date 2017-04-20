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

  async validateGithubToken({ url, token }) {
    dispatch('githubValidateTokenWorking');

    try {
      await new GitHubApiClient({ url, token }).validateToken();
    }
    catch (err) {
      dispatch('githubValidateTokenError', { message: err.message });
      return;
    }

    dispatch('githubValidateTokenSuccess');
  },
};

export default SettingAction;
