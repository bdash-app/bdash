import React from 'react';
import QueryTitle from '../query_title/query_title';
import DataSourceSelect from '../data_source_select/data_source_select';

export default class QueryPanelHeader extends React.Component {
  render() {
    return (
      <div className="QueryPanelHeader">
        <QueryTitle {...this.props} />
        <DataSourceSelect {...this.props} />
      </div>
    );
  }
}
