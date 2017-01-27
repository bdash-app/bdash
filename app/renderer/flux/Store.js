import immup, { Immup } from 'immup';
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

    if (newState instanceof Immup) {
      newState = newState.end();
    }

    this.state = newState;
    this.emit();
  }

  set(...args) {
    return immup(this.state).set(...args);
  }

  merge(...args) {
    return immup(this.state).merge(...args);
  }

  mergeList(...args) {
    return immup(this.state).mergeList(...args);
  }

  del(...args) {
    return immup(this.state).del(...args);
  }

  append(...args) {
    return immup(this.state).append(...args);
  }

  prepend(...args) {
    return immup(this.state).prepend(...args);
  }
}
