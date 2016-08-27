import React from 'react';
import ConnectionSelect from '../connection_select/connection_select';
import SQLEditor from '../sql_editor/sql_editor';
import ResultTable from '../result_table/result_table';

export default class QueryPanel extends React.Component {
  render() {
    return (
      <div className="QueryPanel">
        <ConnectionSelect {...this.props} />
        <SQLEditor {...this.props} />
        <ResultTable {...this.props} />
      </div>
    );
  }
}
