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

class Query extends React.Component<{}, QueryState> {
  componentDidMount() {
    Action.initialize();
  }

  handleAddQuery() {
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

  handleExecute(query: QueryType) {
    const line = this.state.editor.line ?? 0;
    const dataSource = this.findDataSourceById(query.dataSourceId);
    if (dataSource) {
      Action.executeQuery({ query, dataSource, line });
    } else {
      alert("DataSource is missing");
    }
  }

  handleCancel(query: QueryType) {
    if (query.status === "working") {
      Action.cancelQuery(query);
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

    if (!chart) {
      return Promise.reject(new Error(`chart (query id ${query.id}) is not found while sharing on gist`));
    }

    try {
      await QuerySharing.shareOnGist({ query, chart, setting, dataSource });
    } catch (err) {
      alert(err.message);
    }
  }

  renderMain() {
    const query = this.state.queries.find(query => query.id === this.state.selectedQueryId);
    if (!query) return <div className="page-Query-main" />;

    return (
      <div className="page-Query-main">
        <QueryHeader
          query={query}
          {...this.state}
          onChangeTitle={title => Action.updateQuery(query.id, { title })}
          onChangeDataSource={dataSourceId => Action.updateQuery(query.id, { dataSourceId })}
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
            {...this.state}
            onChangeQueryBody={body => Action.updateQuery(query.id, { body })}
            onChangeCursorPosition={line => Action.updateEditor({ line })}
            onChangeEditorHeight={height => Action.updateEditor({ height })}
            onExecute={() => this.handleExecute(query)}
            onCancel={() => this.handleCancel(query)}
          />
          <QueryResult
            query={query}
            {...this.state}
            onClickCopyAsTsv={() => QuerySharing.copyAsTsv(query)}
            onClickCopyAsCsv={() => QuerySharing.copyAsCsv(query)}
            onClickCopyAsMarkdown={() => QuerySharing.copyAsMarkdown(query)}
            onClickShareOnGist={() => this.handleShareOnGist(query)}
            onSelectTab={name => Action.selectResultTab(query, name)}
            onUpdateChart={Action.updateChart}
          />
        </SplitterLayout>
      </div>
    );
  }

  render() {
    return (
      <div className="page-Query">
        <div className="page-Query-list">
          <QueryList
            {...this.state}
            onAddQuery={() => this.handleAddQuery()}
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

export default Container.create(Query, store);
