import React from 'react';

export default class ConnectionSelect extends React.Component {
  handleChange(e) {
    this.props.dispatch('changeConnection', e.target.value);
  }

  render() {
    return (
      <select onChange={this.handleChange.bind(this)}>
        {this.props.connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    );
  }
}
