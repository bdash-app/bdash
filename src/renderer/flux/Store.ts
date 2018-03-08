import immup from "immup";
import { EventEmitter } from "events";

export default class Store {
  static create(StoreClass) {
    const store = new StoreClass();
    const dispatch = store.dispatch.bind(store);

    return { store, dispatch };
  }

  state: any;
  _emitter: EventEmitter;

  constructor() {
    this.state = this.getInitialState();
    this._emitter = new EventEmitter();
  }

  getInitialState() {
    throw new Error("Not Implemented");
  }

  // @ts-ignore
  reduce(type, payload) {
    throw new Error("Not Implemented");
  }

  subscribe(fn) {
    this._emitter.on("update", fn);
    const unsubscribe = () => {
      this._emitter.removeListener("update", fn);
    };
    return unsubscribe;
  }

  emit() {
    this._emitter.emit("update", this.state);
  }

  dispatch(type, payload) {
    this.state = this.getNextState(type, payload);
    this.emit();
  }

  getNextState(type, payload) {
    let nextState: any = this.reduce(type, payload);

    if (nextState === undefined) {
      throw new Error(`${this.constructor.name}.reduce returns undefined, action type: ${type}`);
    }

    if (nextState instanceof StateBuilder) {
      nextState = nextState.end();
    }

    return nextState;
  }

  set(path, value) {
    return new StateBuilder(this.state).set(path, value);
  }

  merge(path, value) {
    return new StateBuilder(this.state).merge(path, value);
  }

  append(path, value) {
    return new StateBuilder(this.state).append(path, value);
  }

  mergeList(path, value, comparator: Comparator = null) {
    if (comparator === null) {
      return new StateBuilder(this.state).mergeList(path, value);
    } else {
      return new StateBuilder(this.state).mergeList(path, value, comparator);
    }
  }

  del(path) {
    return new StateBuilder(this.state).del(path);
  }
}

type Comparator = ((a: any, b: any) => boolean) | null;

class StateBuilder extends immup.Immup {
  mergeList(path, value, comparator = (a, b) => a.id === b.id) {
    return this.set(path, arr => {
      if (!Array.isArray(arr)) {
        throw new Error("target is not an array");
      }

      return value.map(v => {
        const target = arr.find(v2 => comparator(v, v2));
        if (target === undefined) {
          return v;
        } else {
          return immup.merge(target, null, v);
        }
      });
    });
  }
}
