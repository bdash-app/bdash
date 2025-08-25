import moment from "moment";
import { ipcRenderer } from "electron";
import { dispatch } from "./QueryStore";
import { setting } from "../../../lib/Setting";
import Database from "../../../lib/Database";
import Util from "../../../lib/Util";
import DataSource from "../../../lib/DataSource";
import { QueryType, DatabaseQueryType } from "../../../lib/Database/Query";
import { DataSourceType } from "../DataSource/DataSourceStore";

const DEFAULT_QUERY_TITLE = "New Query";

const QueryAction = {
  async initialize(): Promise<void> {
    const [queries, dataSources, charts] = await Promise.all([
      Database.Query.getAll(),
      Database.DataSource.getAll(),
      Database.Chart.getAll(),
    ]);

    dispatch("initialize", {
      queries,
      dataSources,
      charts,
      setting: setting.load(),
    });
  },

  async dataSourceWithTables(): Promise<DataSourceType[]> {
    const dataSources = await Database.DataSource.getAll();
    return Promise.all(
      dataSources.map(async (dataSource) => {
        const ds = DataSource.create(dataSource);
        try {
          const tables = await ds.fetchTables();
          return {
            ...dataSource,
            tables,
          };
        } catch (e) {
          console.log(`Failed to load tables from dataSource "${dataSource.name}"`, e);
          return dataSource;
        }
      })
    );
  },

  async selectQuery(id: number): Promise<void> {
    const query = await Database.Query.find(id);
    dispatch("selectQuery", { id, query });
  },

  async addNewQuery({ dataSourceId }): Promise<void> {
    const query = await Database.Query.create(DEFAULT_QUERY_TITLE, dataSourceId, "");
    dispatch("addNewQuery", { query });
  },

  updateQuery(id: number, params: Partial<QueryType>): Promise<void> {
    dispatch("updateQuery", { id, params });
    return Database.Query.update(id, {
      ...params,
      codeMirrorHistory: params.codeMirrorHistory ? JSON.stringify(params.codeMirrorHistory) : null,
    });
  },

  async duplicateQuery(id: number): Promise<void> {
    const query = await Database.Query.find(id);
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
    dataSource,
  }: {
    line: number;
    query: QueryType;
    dataSource: DataSourceType;
  }): Promise<void> {
    const { query: queryBody, startLine } = await Util.findQueryByLine(query.body, dataSource.mimeType, line);
    const executor = DataSource.create(dataSource);
    const id = query.id;
    const _setting = setting.load();
    dispatch("updateQuery", { id, params: { status: "working", executor } });

    const start = Date.now();
    let result;
    try {
      result = await executor.execute(queryBody, { startLine });
    } catch (err) {
      const params: Partial<DatabaseQueryType> = {
        status: "failure",
        fields: null,
        rows: null,
        runtime: null,
        errorMessage: err.message,
      };
      dispatch("updateQuery", {
        id,
        params: Object.assign({ executor: null }, params),
      });
      Database.Query.update(id, params);

      ipcRenderer.send("queryCompleted", {
        success: false,
        title: query.title,
        errorMessage: err.message,
        _setting,
      });

      return;
    }

    const params: Partial<DatabaseQueryType> = {
      status: "success",
      fields: result.fields,
      rows: result.rows,
      runtime: Date.now() - start,
      runAt: moment(),
      errorMessage: null,
    };
    dispatch("updateQuery", {
      id,
      params: Object.assign({ executor: null }, params),
    });
    Database.Query.update(
      id,
      Object.assign(params, {
        fields: JSON.stringify(params.fields),
        rows: JSON.stringify(params.rows),
        runAt: params.runAt?.utc().format("YYYY-MM-DD HH:mm:ss"),
      })
    );

    ipcRenderer.send("queryCompleted", {
      success: true,
      title: query.title,
      runtime: params.runtime,
      rowCount: result.rows?.length || 0,
      _setting,
    });
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
        queryId: query.id,
      });
      dispatch("addChart", { chart });
    }
  },

  async updateChart(id: number, params): Promise<void> {
    const chart = await Database.Chart.update(id, params);
    dispatch("updateChart", { id, params: chart });
  },
};

export default QueryAction;
