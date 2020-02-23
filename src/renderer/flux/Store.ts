import immup from "immup";
import { EventEmitter } from "events";

export default class Store<T> {
  static create<T>(StoreClass): { store: Store<T>; dispatch: (type: string, payload?: any) => void } {
    const store = new StoreClass();
    const dispatch = store.dispatch.bind(store);

    return { store, dispatch };
  }

  state: T;
  _emitter: EventEmitter;

  constructor() {
    this._emitter = new EventEmitter();
  }

  getInitialState() {
    throw new Error("Not Implemented");
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // @ts-ignore
  reduce(type, payload): T {
    throw new Error("Not Implemented");
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

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

  dispatch(type: string, payload: any) {
    this.state = this.getNextState(type, payload);
    this.emit();
  }

  getNextState(type: string, payload: any): T {
    let nextState: T = this.reduce(type, payload);

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
