import React from 'react';
import QueryTitle from '../query_title/query_title';
import ConnectionSelect from '../connection_select/connection_select';

export default class QueryPanelHeader extends React.Component {
  render() {
    return (
      <div className="QueryPanelHeader">
        <QueryTitle {...this.props} />
        <ConnectionSelect {...this.props} />
      </div>
    );
  }
}
