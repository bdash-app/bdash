import electron from 'electron';
import React from 'react';
import markdownTable from 'markdown-table';
import csvStringify from 'csv-stringify';
import Flyout from 'react-micro-flyout';
import QueryResultTable from '../query_result_table/query_result_table';
import QueryResultChart from '../query_result_chart/query_result_chart';
import Chart from '../../services/Chart';

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

  getTableDataAsTsv() {
    return new Promise((resolve, reject) => {
      csvStringify(this.getTableData(), { delimiter: '\t' }, (err, tsv) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(tsv);
        }
      });
    });
  }

  getChartAsSvg() {
    let query = this.props.query;
    let chart = this.props.charts.filter(chart => {
      return chart.queryId === query.id;
    })[0];

    if (!query || !chart) return Promise.resolve(null);

    let params = {
      type: chart.type,
      x: chart.xColumn,
      y: chart.yColumns,
      stacking: chart.stacking,
      groupBy: chart.groupColumn,
      rows: query.rows,
    };

    return new Chart(params).toSVG();
  }

  handleClickCopyAsTsv() {
    this.setState({ openShareFlyout: false });
    this.getTableDataAsTsv().then(tsv => {
      electron.clipboard.writeText(tsv);
    }).catch(err => {
      console.error(err);
    });
  }

  handleClickCopyAsMarkdown() {
    this.setState({ openShareFlyout: false });
    electron.clipboard.writeText(markdownTable(this.getTableData()));
  }

  handleClickShareOnGist() {
    this.setState({ openShareFlyout: false });
    let query = this.props.query;
    let github = this.props.setting.github;
    let baseUrl = github.url || 'https://github.com';
    let token = github.token;

    if (!token) {
      console.error('Github token is required');
      return;
    }

    Promise.all([this.getTableDataAsTsv(), this.getChartAsSvg()]).then(([tsv, svg]) => {
      let files = {
        'query.sql': { content: query.body },
        'result.tsv': { content: tsv },
      };
      if (svg) {
        files['result2.svg'] = { content: svg };
      }

      return fetch(`${baseUrl}/gists?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: query.title,
          public: false,
          files,
        }),
      });
    }).then(response => {
      return response.json();
    }).then(json => {
      electron.shell.openExternal(json.html_url);
    }).catch(err => {
      console.error(err);
    });
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
            <li onClick={() => this.handleClickShareOnGist()}>Share on gist</li>
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
