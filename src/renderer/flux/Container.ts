import Store from "./Store";

export default {
  create<T extends Record<string, any>>(
    Component: React.ComponentClass<unknown, T>,
    store: Store<T>
  ): React.ComponentClass<unknown, T> {
    return class Container extends Component {
      _unsubscribe: any;

      constructor(...args) {
        // @ts-ignore
        super(...args);
        this.state = store.state;
        this._unsubscribe = store.subscribe((state: T) => this.setState(state));
      }

      override componentWillUnmount(): void {
        if (super.componentWillUnmount) {
          super.componentWillUnmount();
        }

        this._unsubscribe();
      }
    };
  },
};
