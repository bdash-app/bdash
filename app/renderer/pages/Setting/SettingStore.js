import Store from '../../flux/Store';

export default class SettingStore extends Store {
  getInitialState() {
    return {
      githubValidateTokenSuccess: null,
      githubValidateTokenError: null,
      keyBind: 'default',
      setting: {},
    };
  }

  reduce(type, payload) {
  }
}

let { store, dispatch } = Store.create(SettingStore);
export { store, dispatch };
