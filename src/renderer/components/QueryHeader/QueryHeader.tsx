import React from "react";
import Select from "react-select";
import { selectStyles } from "../Select";

export default class QueryHeader extends React.Component<any, any> {
  handleChangeTitle(e) {
    this.props.onChangeTitle(e.target.value);
  }

  handleChangeDataSource(e) {
    this.props.onChangeDataSource(e.value);
  }

  render() {
    const options = this.props.dataSources.map(dataSource => {
      return { value: dataSource.id, label: dataSource.name };
    });
    const currentOption = options.find(option => option.value === this.props.query.dataSourceId);

    return (
      <div className="QueryHeader">
        <input
          className="QueryHeader-inputTitle"
          type="text"
          value={this.props.query.title}
          onChange={e => this.handleChangeTitle(e)}
        />
        <Select
          className="QueryHeader-selectDataSource"
          value={currentOption}
          options={options}
          onChange={e => this.handleChangeDataSource(e)}
          placeholder={"Select data source..."}
          isClearable={false}
          isSearchable={false}
          styles={selectStyles}
        />
      </div>
    );
  }
}
