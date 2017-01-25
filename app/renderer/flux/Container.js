export default {
  create(Component, store) {
    return class Container extends Component {
      constructor(...args) {
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
  },
};
