import Store from '../../flux/Store';
import immup from 'immup';

export default class AppStore extends Store {
  getInitialState() {
    return {
      initialized: false,
      selectedPage: 'query',
    };
  }

  reduce(type, payload) {
    switch (type) {
      case 'initialize':
        return immup.set(this.state, 'initialized', payload.initialized);
      case 'selectPage':
        return immup.set(this.state, 'selectedPage', payload.page);
    }
  }
}

let { store, dispatch } = Store.create(AppStore);
export { store, dispatch };
