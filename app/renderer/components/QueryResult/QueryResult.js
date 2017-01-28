import React from 'react';
import QueryResultNav from '../QueryResultNav';
import QueryResultTable from '../QueryResultTable';

export default class QueryResult extends React.Component {
  renderError() {
    return (
      <div className="QueryResult">
        <div className="QueryResult-errorMessage">{this.props.query.errorMessage}</div>
      </div>
    );
  }

  render() {
    let query = this.props.query;

    if (query.status === 'failure') {
      return <div className="QueryResult">
        <div className="QueryResult-errorMessage">{query.errorMessage}</div>
      </div>;
    }

    if (!query.fields || !query.rows) {
      return <div className="QueryResult" />;
    }

    return <div className="QueryResult">
      <QueryResultNav {...this.props} />
      <QueryResultTable {...this.props} />
    </div>;
  }
}
