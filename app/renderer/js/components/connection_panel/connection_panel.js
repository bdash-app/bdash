import React from 'react';
import _ from 'lodash';
import ConnectionList from '../connection_list/connection_list';
import TableList from '../table_list/table_list';
import TableSummary from '../table_summary/table_summary';
import ConnectionFormModal from '../connection_form_modal/connection_form_modal';

export default class ConnectionPanel extends React.Component {
  render() {
    let connection = _.find(this.props.connections, { id: this.props.selectedConnectionId });

    return (
      <div className="ConnectionPanel">
        <div className="ConnectionPanel-connectionList">
          <ConnectionList {...this.props} />
        </div>
        <div className="ConnectionPanel-tableList">
          <TableList connection={connection} {...this.props} />
        </div>
        <div className="ConnectionPanel-tableSummary">
          <TableSummary connection={connection} {...this.props} />
        </div>
        <ConnectionFormModal
          dispatch={this.props.dispatch}
          connectionTest={this.props.connectionTest}
          connectionFormValues={this.props.connectionFormValues}
          />
      </div>
    );
  }
}
