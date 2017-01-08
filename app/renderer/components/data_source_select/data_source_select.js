import React from 'react';
import Select from 'react-select';

export default class DataSourceSelect extends React.Component {
  handleChange(e) {
    this.props.dispatch('changeDataSource', this.props.query, e.value);
  }

  render() {
    let options = this.props.dataSources.map(dataSource => {
      return { value: dataSource.id, label: dataSource.name };
    });

    return (
      <div className="DataSourceSelect">
        <Select
          value={this.props.query.dataSourceId}
          options={options}
          onChange={(e) => this.handleChange(e)}
          placeholder={'Select data source...'}
          clearable={false}
          />
      </div>
    );
  }
}
