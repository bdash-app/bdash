import React from 'react';
import _ from 'lodash';
import DataSourceList from '../data_source_list/data_source_list';
import TableList from '../table_list/table_list';
import TableSummary from '../table_summary/table_summary';
import DataSourceFormModal from '../data_source_form_modal/data_source_form_modal';

export default class DataSourcePanel extends React.Component {
  render() {
    let dataSource = _.find(this.props.dataSources, { id: this.props.selectedDataSourceId });

    return (
      <div className="DataSourcePanel">
        <div className="DataSourcePanel-dataSourceList">
          <DataSourceList {...this.props} />
        </div>
        <div className="DataSourcePanel-tableList">
          <TableList dataSource={dataSource} {...this.props} />
        </div>
        <div className="DataSourcePanel-tableSummary">
          <TableSummary dataSource={dataSource} {...this.props} />
        </div>
        <DataSourceFormModal
          dispatch={this.props.dispatch}
          connectionTest={this.props.connectionTest}
          dataSourceFormValues={this.props.dataSourceFormValues}
          />
      </div>
    );
  }
}
