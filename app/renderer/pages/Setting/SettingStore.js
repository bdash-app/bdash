import Store from '../../flux/Store';
import Setting from '../../../domain/Setting';

export default class SettingStore extends Store {
  getInitialState() {
    return {
      githubValidateToken: {
        status: null,
        error: null,
      },
      setting: Setting.getDefault(),
    };
  }

  reduce(type, payload) {
    switch (type) {
      case 'initialize':
      case 'update': {
        return this.merge('setting', payload.setting);
      }
      case 'githubValidateTokenWorking': {
        return this.merge('githubValidateToken', { status: 'working', error: null });
      }
      case 'githubValidateTokenSuccess': {
        return this.merge('githubValidateToken', { status: 'success', error: null });
      }
      case 'githubValidateTokenError': {
        return this.merge('githubValidateToken', { status: 'failure', error: payload.message });
      }
    }
  }
}

let { store, dispatch } = Store.create(SettingStore);
export { store, dispatch };
