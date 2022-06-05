import React from "react";
import QueryResultNav from "../QueryResultNav";
import QueryResultTable from "../QueryResultTable";
import QueryResultChart from "../QueryResultChart";
import { ChartType } from "../../../lib/Database/Chart";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly query: QueryType;
  readonly charts: ChartType[];
  readonly onClickCopyAsJson: () => void;
  readonly onClickCopyAsTsv: () => void;
  readonly onClickCopyAsCsv: () => void;
  readonly onClickCopyAsMarkdown: () => void;
  readonly onClickShareOnGist: () => void;
  readonly onClickShareOnBdashServer: () => void;
  readonly onSelectTab: (tabName: string) => void;
  readonly onUpdateChart: (id: number, params: any) => void;
};

const QueryResult: React.FC<Props> = ({
  query,
  charts,
  onClickCopyAsJson,
  onClickCopyAsTsv,
  onClickCopyAsCsv,
  onClickCopyAsMarkdown,
  onClickShareOnGist,
  onClickShareOnBdashServer,
  onSelectTab,
  onUpdateChart,
}) => {
  const renderMain = (): React.ReactNode => {
    if (query.selectedTab === "chart") {
      const chart = charts.find((chart) => chart.queryId === query.id);
      return <QueryResultChart chart={chart} query={query} onUpdateChart={onUpdateChart} />;
    } else {
      return <QueryResultTable query={query} />;
    }
  };

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
      <QueryResultNav
        query={query}
        onClickCopyAsCsv={onClickCopyAsCsv}
        onClickCopyAsJson={onClickCopyAsJson}
        onClickCopyAsMarkdown={onClickCopyAsMarkdown}
        onClickCopyAsTsv={onClickCopyAsTsv}
        onClickShareOnBdashServer={onClickShareOnBdashServer}
        onClickShareOnGist={onClickShareOnGist}
        onSelectTab={onSelectTab}
      />
      {renderMain()}
    </div>
  );
};

export default QueryResult;
