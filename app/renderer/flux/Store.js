import immup from 'immup';
import { EventEmitter } from 'events';

export default class Store {
  static create(StoreClass) {
    let store = new StoreClass();
    let dispatch = store.dispatch.bind(store);

    return { store, dispatch };
  }

  constructor() {
    this.state = this.getInitialState();
    this._emitter = new EventEmitter();
  }

  subscribe(fn) {
    this._emitter.on('update', fn);
    let unsubscribe = () => { this._emitter.removeListener('update', fn); };
    return unsubscribe;
  }

  emit() {
    this._emitter.emit('update', this.state);
  }

  dispatch(type, payload) {
    this.state = this.getNextState(type, payload);
    this.emit();
  }

  getNextState(type, payload) {
    let nextState = this.reduce(type, payload);

    if (nextState === undefined) {
      throw new Error(`${this.constructor.name}.reduce returns undefined, action type: ${type}`);
    }

    if (nextState instanceof StateBuilder) {
      nextState = nextState.end();
    }

    return nextState;
  }
}

class StateBuilder extends immup.Immup {
  mergeList(path, value, comparator = (a, b) => a.id === b.id) {
    return this.set(path, arr => {
      if (!Array.isArray(arr)) {
        throw new Error('target is not an array');
      }

      return value.map(v => {
        let target = arr.find(v2 => comparator(v, v2));
        if (target === undefined) {
          return v;
        }
        else {
          return immup.merge(target, null, v);
        }
      });
    });
  }
}

['set', 'del', 'merge', 'append', 'prepend', 'mergeList'].forEach(method => {
  Store.prototype[method] = function(...args) {
    return new StateBuilder(this.state)[method](...args);
  };
});
