import { dispatch } from './SettingStore';
import { setting } from '../../../domain/Setting';
import GitHubApiClient from '../../../domain/GitHubApiClient';

export default {
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
