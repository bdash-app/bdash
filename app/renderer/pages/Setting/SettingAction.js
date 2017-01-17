import { dispatch } from './SettingStore';
import { setting } from '../../../domain/Setting';
import GitHubApiClient from '../../../domain/GitHubApiClient';

export function initialize() {
  dispatch('initialize', { setting: setting.load() });
}

export function update(params) {
  setting.save(params);
  dispatch('update', { setting: params });
}

export function validateGithubToken({ url, token }) {
  dispatch('githubValidateTokenWorking');
  new GitHubApiClient({ url, token }).validateToken().then(() => {
    dispatch('githubValidateTokenSuccess');
  }).catch(err => {
    dispatch('githubValidateTokenError', { message: err.message });
  });
}

export default {
  initialize,
  update,
  validateGithubToken,
};
