import Store from '../../flux/Store';
import immup from 'immup';

export default class SettingStore extends Store {
  getInitialState() {
    return {
      githubValidateToken: {
        status: null,
        error: null,
      },
      setting: {
        keyBind: 'default',
        github: {
          token: null,
          url: null,
        },
      },
    };
  }

  reduce(type, payload) {
    switch (type) {
      case 'initialize':
      case 'update':
        return immup.merge(this.state, 'setting', payload.setting);
      case 'githubValidateTokenWorking':
        return immup.merge(this.state, 'githubValidateToken', { status: 'working', error: null });
      case 'githubValidateTokenSuccess':
        return immup.merge(this.state, 'githubValidateToken', { status: 'success', error: null });
      case 'githubValidateTokenError':
        return immup.merge(this.state, 'githubValidateToken', { status: 'failure', error: payload.message });
    }
  }
}

let { store, dispatch } = Store.create(SettingStore);
export { store, dispatch };
