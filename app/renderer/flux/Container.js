import React from 'react';

export default class Container extends React.Component {
  connect(store) {
    this.state = store.state;
    this.unsubscribe = store.subscribe(state => this.setState(state));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
}
