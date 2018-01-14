import Store from '../../flux/Store';

export default class AppStore extends Store {
  getInitialState() {
    return {
      initialized: false,
      selectedPage: 'query',
    };
  }

  reduce(type, payload) {
    switch (type) {
      case 'initialize': {
        return this.set('initialized', true);
      }
      case 'selectPage': {
        return this.set('selectedPage', payload.page);
      }
    }
  }
}

let { store, dispatch } = Store.create(AppStore);
export { store, dispatch };
