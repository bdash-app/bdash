import React from "react";
import QueryResultNav from "../QueryResultNav";
import QueryResultTable from "../QueryResultTable";
import QueryResultChart from "../QueryResultChart";
import { ChartType } from "../../../lib/Database/Chart";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly query: QueryType;
  readonly charts: ChartType[];
  readonly onClickCopyAsTsv: () => void;
  readonly onClickCopyAsCsv: () => void;
  readonly onClickCopyAsMarkdown: () => void;
  readonly onClickShareOnGist: () => void;
  readonly onSelectTab: (tabName: string) => void;
  readonly onUpdateChart: (id: number, params: any) => void;
};

export default class QueryResult extends React.Component<Props> {
  renderError() {
    return (
      <div className="QueryResult">
        <div className="QueryResult-errorMessage">{this.props.query.errorMessage}</div>
      </div>
    );
  }

  renderMain() {
    if (this.props.query.selectedTab === "chart") {
      const chart = this.props.charts.find(chart => chart.queryId === this.props.query.id);
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
