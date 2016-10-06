import React from 'react';
import Select from 'react-select';

export default class ConnectionSelect extends React.Component {
  handleChange(e) {
    this.props.dispatch('changeConnection', this.props.query, e.value);
  }

  render() {
    let options = this.props.connections.map(connection => {
      return { value: connection.id, label: connection.name };
    });

    return (
      <div className="ConnectionSelect">
        <Select
          value={this.props.query.connectionId}
          options={options}
          onChange={(e) => this.handleChange(e)}
          placeholder={'Select data source...'}
          clearable={false}
          />
      </div>
    );
  }
}
