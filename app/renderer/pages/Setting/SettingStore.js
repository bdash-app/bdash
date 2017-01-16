import Store from '../../flux/Store';
import immup from 'immup';

export default class SettingStore extends Store {
  getInitialState() {
    return {
      githubValidateTokenSuccess: null,
      githubValidateTokenError: null,
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
    }
  }
}

let { store, dispatch } = Store.create(SettingStore);
export { store, dispatch };
