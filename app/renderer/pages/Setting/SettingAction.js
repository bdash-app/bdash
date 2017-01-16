import { dispatch } from './SettingStore';
import { setting } from '../../../domain/Setting';

export function initialize() {
  dispatch('initialize', { setting: setting.load() });
}

export function update(params) {
  setting.save(params);
  dispatch('update', { setting: params });
}

export function validateGithubToken({ url, token }) {
}

export default {
  initialize,
  update,
};
