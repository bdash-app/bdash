import React from 'react';

export default class ConnectionSelect extends React.Component {
  handleChange(e) {
    this.props.dispatch('changeConnection', this.props.query, Number(e.target.value));
  }

  render() {
    let options = this.props.connections.map(connection => {
      return <option key={connection.id} value={connection.id}>{connection.name}</option>;
    });

    return (
      <select
        className="ConnectionSelect"
        value={this.props.query.connectionId}
        onChange={this.handleChange.bind(this)}
        >
        {options}
      </select>
    );
  }
}
