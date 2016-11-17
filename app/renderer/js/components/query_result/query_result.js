import electron from 'electron';
import React from 'react';
import markdownTable from 'markdown-table';
import csvStringify from 'csv-stringify';
import Flyout from 'react-micro-flyout';
import QueryResultTable from '../query_result_table/query_result_table';
import QueryResultChart from '../query_result_chart/query_result_chart';

export default class QueryResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = { openShareFlyout: false };
  }

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

  getTableData() {
    let query = this.props.query;
    let header = [query.fields.map(f => f.name)];
    let rows = query.rows.map(row => Object.values(row));

    return header.concat(rows);
  }

  handleClickCopyAsTsv() {
    this.setState({ openShareFlyout: false });
    csvStringify(this.getTableData(), { delimiter: '\t' }, (err, tsv) => {
      if (err) {
        console.error(err);
      }
      else {
        electron.clipboard.writeText(tsv);
      }
    });
  }

  handleClickCopyAsMarkdown() {
    this.setState({ openShareFlyout: false });
    electron.clipboard.writeText(markdownTable(this.getTableData()));
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
      <div className="QueryResult-share">
        <span
          className="QueryResult-shareBtn"
          onClick={() => this.setState({ openShareFlyout: true })}>
          <i className="fa fa-share-alt"></i></span>
        <Flyout
          open={this.state.openShareFlyout}
          className="QueryResult-shareFlyout"
          onRequestClose={() => this.setState({ openShareFlyout: false })}>
          <ul>
            <li onClick={() => this.handleClickCopyAsTsv()}>Copy table as TSV</li>
            <li onClick={() => this.handleClickCopyAsMarkdown()}>Copy table as Markdown</li>
          </ul>
        </Flyout>
      </div>
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
