import React from 'react';
import QueryTitle from '../query_title/query_title';
import ConnectionSelect from '../connection_select/connection_select';

export default class QueryPanelHeader extends React.Component {
  handleClickDelete() {
    if (window.confirm('Are you sure?')) {
      this.props.dispatch('deleteQuery', this.props.query.id);
    }
  }

  render() {
    return (
      <div className="QueryPanelHeader">
        <QueryTitle {...this.props} />
        <ConnectionSelect {...this.props} />
        <div className="QueryPanelHeader-delete" onClick={() => this.handleClickDelete()}>
          <i className="fa fa-trash"></i>
        </div>
      </div>
    );
  }
}
