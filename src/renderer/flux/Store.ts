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

  getInitialState(): any {
    throw new Error("Not Implemented");
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // @ts-ignore
  reduce(type: string, payload: any): StateBuilder<T> {
    throw new Error("Not Implemented");
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  subscribe(fn): () => void {
    this._emitter.on("update", fn);
    const unsubscribe = (): void => {
      this._emitter.removeListener("update", fn);
    };
    return unsubscribe;
  }

  emit(): void {
    this._emitter.emit("update", this.state);
  }

  dispatch(type: string, payload: any): void {
    this.state = this.getNextState(type, payload);
    this.emit();
  }

  getNextState(type: string, payload: any): T {
    return this.reduce(type, payload).end();
  }

  set(path: string, value: any): StateBuilder<T> {
    return new StateBuilder(this.state).set(path, value);
  }

  merge(path: string, value: any): StateBuilder<T> {
    return new StateBuilder(this.state).merge(path, value);
  }

  append(path: string, value: any): StateBuilder<T> {
    return new StateBuilder(this.state).append(path, value);
  }

  mergeList(path: string, value: any, comparator: Comparator = null): StateBuilder<T> {
    if (comparator === null) {
      return new StateBuilder(this.state).mergeList(path, value);
    } else {
      return new StateBuilder(this.state).mergeList(path, value, comparator);
    }
  }

  del(path: string): StateBuilder<T> {
    return new StateBuilder(this.state).del(path);
  }
}

type Comparator = ((a: any, b: any) => boolean) | null;

export class StateBuilder<State> extends immup.Immup<State> {
  mergeList(path: string, value: any, comparator = (a, b): boolean => a.id === b.id): any {
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
