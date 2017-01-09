import React from 'react';

export default class Container extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = this.store.state;
    this.unsubscribe = this.store.subscribe(state => this.setState(state));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }
}
