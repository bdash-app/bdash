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
    let newState = this.reduce(type, payload);

    if (newState === undefined) {
      throw new Error(`${this.constructor.name}.reduce returns undefined, action type: ${type}`);
    }

    this.state = newState;
    this.emit();
  }
}
