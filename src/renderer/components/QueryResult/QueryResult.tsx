import * as React from "react";
import QueryResultNav from "../QueryResultNav";
import QueryResultTable from "../QueryResultTable";
import QueryResultChart from "../QueryResultChart";

export default class QueryResult extends React.Component<any, any> {
  renderError() {
    return (
      <div className="QueryResult">
        <div className="QueryResult-errorMessage">
          {this.props.query.errorMessage}
        </div>
      </div>
    );
  }

  renderMain() {
    if (this.props.query.selectedTab === "chart") {
      const chart = this.props.charts.find(
        chart => chart.queryId === this.props.query.id
      );
      return <QueryResultChart chart={chart} {...this.props} />;
    } else {
      return <QueryResultTable {...this.props} />;
    }
  }

  render() {
    const query = this.props.query;

    if (query.status === "failure") {
      return (
        <div className="QueryResult">
          <div className="QueryResult-errorMessage">{query.errorMessage}</div>
        </div>
      );
    }

    if (!query.fields || !query.rows) {
      return <div className="QueryResult" />;
    }

    return (
      <div className="QueryResult">
        <QueryResultNav {...this.props} />
        {this.renderMain()}
      </div>
    );
  }
}
