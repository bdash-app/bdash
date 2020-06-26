import React from "react";
import SplitterLayout from "react-splitter-layout";
import QuerySharing from "../../../lib/QuerySharing";
import { store, QueryState } from "./QueryStore";
import Action from "./QueryAction";
import Container from "../../flux/Container";
import QueryList from "../../components/QueryList";
import QueryHeader from "../../components/QueryHeader";
import QueryEditor from "../../components/QueryEditor";
import QueryResult from "../../components/QueryResult";
import { QueryType } from "../../../lib/Database/Query";
import { DataSourceType } from "../DataSource/DataSourceStore";

class Query extends React.Component<unknown, QueryState> {
  componentDidMount(): void {
    Action.initialize();
  }

  handleAddQuery(): void {
    const defaultDataSourceId: number | undefined = this.state.setting.defaultDataSourceId;
    const ds =
      defaultDataSourceId !== undefined ? this.findDataSourceById(defaultDataSourceId) : this.state.dataSources[0];
    if (ds) {
      Action.addNewQuery({ dataSourceId: ds.id });
    } else {
      alert("Please create data source");
    }
  }

  findDataSourceById(id: number): DataSourceType | undefined {
    return this.state.dataSources.find(ds => ds.id === id);
  }

  async handleExecute(query: QueryType): Promise<void> {
    const line = this.state.editor.line ?? 0;
    const dataSource = this.findDataSourceById(query.dataSourceId);
    if (dataSource) {
      await Action.executeQuery({ query, dataSource, line });
    } else {
      alert("DataSource is missing");
    }
  }

  async handleCancel(query: QueryType): Promise<void> {
    if (query.status === "working") {
      await Action.cancelQuery(query);
    }
  }

  async handleShareOnGist(query: QueryType): Promise<void> {
    const chart = this.state.charts.find(chart => chart.queryId === query.id);
    const setting = this.state.setting.github;
    const dataSource = this.state.dataSources.find(ds => ds.id === query.dataSourceId);

    if (!setting.token) {
      alert("Set your Github token");
      return;
    }
    if (!dataSource) {
      alert("DataSource is not selected");
      return;
    }

    try {
      await QuerySharing.shareOnGist({ query, chart, setting, dataSource });
    } catch (err) {
      alert(err.message);
    }
  }

  renderMain(): React.ReactNode {
    const query = this.state.queries.find(query => query.id === this.state.selectedQueryId);
    if (!query) return <div className="page-Query-main" />;
    const dataSource = this.state.dataSources.find(dataSource => dataSource.id === query.dataSourceId);

    return (
      <div className="page-Query-main">
        <QueryHeader
          query={query}
          {...this.state}
          onChangeTitle={(title): void => {
            Action.updateQuery(query.id, { title });
          }}
          onChangeDataSource={(dataSourceId): void => {
            Action.updateQuery(query.id, { dataSourceId });
          }}
        />
        <SplitterLayout
          vertical={true}
          primaryIndex={1}
          primaryMinSize={100}
          secondaryMinSize={100}
          customClassName="page-Query-splitter-layout"
        >
          <QueryEditor
            query={query}
            mimeType={dataSource?.mimeType ?? "text/x-sql"}
            {...this.state}
            onChangeQueryBody={(body): void => {
              Action.updateQuery(query.id, { body });
            }}
            onChangeCursorPosition={(line): void => Action.updateEditor({ line })}
            onChangeEditorHeight={(height): void => Action.updateEditor({ height })}
            onExecute={(): void => {
              this.handleExecute(query);
            }}
            onCancel={(): void => {
              this.handleCancel(query);
            }}
          />
          <QueryResult
            query={query}
            {...this.state}
            onClickCopyAsTsv={(): void => {
              QuerySharing.copyAsTsv(query);
            }}
            onClickCopyAsCsv={(): void => {
              QuerySharing.copyAsCsv(query);
            }}
            onClickCopyAsMarkdown={(): void => QuerySharing.copyAsMarkdown(query)}
            onClickShareOnGist={(): void => {
              this.handleShareOnGist(query);
            }}
            onSelectTab={(name): void => {
              Action.selectResultTab(query, name);
            }}
            onUpdateChart={Action.updateChart}
          />
        </SplitterLayout>
      </div>
    );
  }

  render(): React.ReactNode {
    return (
      <div className="page-Query">
        <div className="page-Query-list">
          <QueryList
            {...this.state}
            onAddQuery={(): void => {
              this.handleAddQuery();
            }}
            onSelectQuery={Action.selectQuery}
            onDuplicateQuery={Action.duplicateQuery}
            onDeleteQuery={Action.deleteQuery}
          />
        </div>
        {this.renderMain()}
      </div>
    );
  }
}

export default Container.create<QueryState>(Query, store);
