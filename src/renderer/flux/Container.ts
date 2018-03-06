export default {
  create(Component: React.ComponentClass, store) {
    return class Container extends Component {
      _unsubscribe: any;

      constructor(...args) {
        // @ts-ignore
        super(...args);
        this.state = store.state;
        this._unsubscribe = store.subscribe(state => this.setState(state));
      }

      componentWillUnmount() {
        if (super.componentWillUnmount) {
          super.componentWillUnmount();
        }

        this._unsubscribe();
      }
    };
  }
};
