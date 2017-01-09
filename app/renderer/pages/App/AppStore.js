import Store from '../../flux/Store';
import immup from 'immup';

export default class AppStore extends Store {
  getInitialState() {
    return { selectedPage: 'query' };
  }

  reduce(type, payload) {
    switch (type) {
      case 'selectPage':
        return immup.set(this.state, 'selectedPage', payload.page);
    }
  }
}

let store = new AppStore();
let dispatch = store.dispatch.bind(store);

export { store, dispatch };
