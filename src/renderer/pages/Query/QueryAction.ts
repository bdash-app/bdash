import moment from "moment";
import { dispatch } from "./QueryStore";
import { setting } from "../../../lib/Setting";
import Database from "../../../lib/Database";
import Util from "../../../lib/Util";
import DataSource from "../../../lib/DataSource";
import { QueryType } from "../../../lib/Database/Query";
import { DataSourceType } from "../DataSource/DataSourceStore";
import { QueryExecutionType, QueryExecution } from "../../../lib/Database/QueryExecution";

const DEFAULT_QUERY_TITLE = "New Query";
const MAX_QUERY_HISTORIES = 10;

const QueryAction = {
  async initialize(): Promise<void> {
    const [queries, dataSources, charts] = await Promise.all([
      Database.Query.getAll(),
      Database.DataSource.getAll(),
      Database.Chart.getAll()
    ]);

    dispatch("initialize", {
      queries,
      dataSources,
      charts,
      setting: setting.load()
    });
  },

  async selectQuery(query: QueryType): Promise<void> {
    const id = query.id;
    if (query.body === undefined) {
      const query = await Database.Query.find(id);
      dispatch("selectQuery", { id, query });
    } else {
      dispatch("selectQuery", { id, query: {} });
    }
  },

  async addNewQuery({ dataSourceId }): Promise<void> {
    const query = await Database.Query.create(DEFAULT_QUERY_TITLE, dataSourceId, "");
    dispatch("addNewQuery", { query });
  },

  updateQuery(id: number, params: any): Promise<void> {
    dispatch("updateQuery", { id, params });
    return Database.Query.update(id, params);
  },

  async duplicateQuery(query: QueryType): Promise<void> {
    const newQuery = await Database.Query.create(query.title, query.dataSourceId, query.body);
    dispatch("addNewQuery", { query: newQuery });
  },

  async deleteQuery(id: number): Promise<void> {
    await Database.Query.del(id);
    dispatch("deleteQuery", { id });
  },

  async executeQuery({
    line,
    query,
    dataSource
  }: {
    line: number;
    query: QueryType;
    dataSource: DataSourceType;
  }): Promise<void> {
    const { query: queryBody, startLine } = await Util.findQueryByLine(query.body, line);
    const executor = DataSource.create(dataSource);
    const id = query.id;
    dispatch("updateQuery", { id, params: { status: "working", executor } });

    const start = Date.now();
    let result;
    try {
      result = await executor.execute(queryBody, { startLine });
    } catch (err) {
      const params: Partial<QueryType> = {
        status: "failure",
        fields: null,
        rows: null,
        runtime: null,
        errorMessage: err.message,
        execution: null
      };
      dispatch("updateQuery", {
        id,
        params: Object.assign({ executor: null }, params)
      });
      Database.Query.update(id, params);
      return;
    }

    const runAt: moment.Moment = moment();
    const params: Partial<QueryType> = {
      status: "success",
      fields: result.fields,
      rows: result.rows,
      runtime: Date.now() - start,
      runAt,
      errorMessage: null
    };
    dispatch("updateQuery", {
      id,
      params: Object.assign({ executor: null }, params)
    });
    await Database.Query.update(
      id,
      Object.assign(params, {
        fields: JSON.stringify(params.fields),
        rows: JSON.stringify(params.rows),
        runAt: runAt.utc().format("YYYY-MM-DD HH:mm:ss")
      })
    );
    const queryExecutionId = await Database.QueryExecution.create(id, queryBody, result.fields, result.rows, runAt);
    const queryExecution: QueryExecutionType = {
      id: queryExecutionId,
      queryId: id,
      body: queryBody,
      fields: result.fields,
      rows: result.rows,
      runAt
    };
    if (query.histories.length >= MAX_QUERY_HISTORIES) {
      const deleteExecution = query.histories[query.histories.length - 1];
      await Database.QueryExecution.delete(deleteExecution.id);
      dispatch("deleteExecution", { id: query.id, index: query.histories.length - 1 });
    }
    dispatch("addExecution", { queryExecution });
  },

  async cancelQuery(query: QueryType): Promise<void> {
    dispatch("updateQuery", { id: query.id, params: { executor: null } });
    await query.executor?.cancel();
  },

  updateEditor(params): void {
    dispatch("updateEditor", params);
  },

  async selectResultTab(query: QueryType, name: string): Promise<void> {
    dispatch("selectResultTab", { id: query.id, name });

    if (name === "chart" && !query.chart) {
      const chart = await Database.Chart.findOrCreateByQueryId({
        queryId: query.id
      });
      dispatch("addChart", { chart });
    }
  },

  async updateChart(id: number, params): Promise<void> {
    const chart = await Database.Chart.update(id, params);
    dispatch("updateChart", { id, params: chart });
  },

  setHistoryToLatest(queryId: number): void {
    dispatch("setHistoryToLatest", { queryId });
  },

  async setQueryExecution(queryId: number, queryExecutionId: number): Promise<void> {
    const queryExecution = await QueryExecution.find(queryExecutionId);
    dispatch("setQueryExecution", { queryId, queryExecution });
  }
};

export default QueryAction;
