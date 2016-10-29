import React from 'react';
import QueryResultTable from '../query_result_table/query_result_table';
import QueryResultChart from '../query_result_chart/query_result_chart';

export default class QueryResult extends React.Component {
  selectTable() {
    this.props.dispatch('changeQueryResultSelectedTab', this.props.query, 'table');
  }

  selectChart() {
    this.props.dispatch('changeQueryResultSelectedTab', this.props.query, 'chart');
  }

  selectedTable() {
    return this.props.query.selectedTab === 'table';
  }

  selectedChart() {
    return this.props.query.selectedTab === 'chart';
  }

  renderError() {
    return (
      <div className="QueryResult">
        <div className="QueryResult-errorMessage">{this.props.query.errorMessage}</div>
      </div>
    );
  }

  renderTab() {
    return <div className="QueryResult-tab">
      <span
        className={this.selectedTable() ? 'is-selected' : ''}
        onClick={() => this.selectTable()}
        ><i className="fa fa-table"></i></span>
      <span
        className={this.selectedChart() ? 'is-selected' : ''}
        onClick={() => this.selectChart()}>
        <i className="fa fa-bar-chart"></i></span>
    </div>;
  }

  render() {
    let query = this.props.query;
    if (query.status === 'failure') {
      return this.renderError();
    }
    if (query.status !== 'success') {
      return null;
    }

    let chart = this.props.charts.filter(chart => {
      return chart.queryId === query.id;
    })[0];

    return <div className="QueryResult">
      {this.renderTab()}
      <QueryResultTable query={query} {...this.props} />
      <QueryResultChart query={query} chart={chart} {...this.props} />
    </div>;
  }
}
