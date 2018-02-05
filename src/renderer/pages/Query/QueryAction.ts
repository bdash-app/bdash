import moment from "moment";
import { dispatch } from "./QueryStore";
import { setting } from "../../../lib/Setting";
import Database from "../../../lib/Database";
import Util from "../../../lib/Util";
import DataSource from "../../../lib/DataSource";

const DEFAULT_QUERY_TITLE = "New Query";

const QueryAction = {
  async initialize() {
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

  async selectQuery(query) {
    const id = query.id;
    if (query.body === undefined) {
      const query = await Database.Query.find(id);
      dispatch("selectQuery", { id, query });
    } else {
      dispatch("selectQuery", { id, query: {} });
    }
  },

  async addNewQuery({ dataSourceId }) {
    const query = await Database.Query.create({
      title: DEFAULT_QUERY_TITLE,
      dataSourceId
    });
    dispatch("addNewQuery", { query });
  },

  updateQuery(id, params) {
    dispatch("updateQuery", { id, params });
    Database.Query.update(id, params);
  },

  async deleteQuery(id) {
    await Database.Query.del(id);
    dispatch("deleteQuery", { id });
  },

  async executeQuery({ line, query, dataSource }) {
    const { query: queryBody, startLine } = Util.findQueryByLine(query.body, line);
    const executor = DataSource.create(dataSource);
    const id = query.id;
    dispatch("updateQuery", { id, params: { status: "working", executor } });

    const start = Date.now();
    let result;
    try {
      result = await executor.execute(queryBody, { startLine });
    } catch (err) {
      const params = {
        status: "failure",
        fields: null,
        rows: null,
        runtime: null,
        errorMessage: err.message
      };
      dispatch("updateQuery", {
        id,
        params: Object.assign({ executor: null }, params)
      });
      Database.Query.update(id, params);
      return;
    }

    const params = {
      status: "success",
      fields: result.fields,
      rows: result.rows,
      runtime: Date.now() - start,
      runAt: moment()
        .utc()
        .format("YYYY-MM-DD HH:mm:ss"),
      errorMessage: null
    };
    dispatch("updateQuery", {
      id,
      params: Object.assign({ executor: null }, params)
    });
    Database.Query.update(
      id,
      Object.assign(params, {
        fields: JSON.stringify(params.fields),
        rows: JSON.stringify(params.rows)
      })
    );
  },

  cancelQuery(query) {
    dispatch("updateQuery", { id: query.id, params: { executor: null } });
    query.executor.cancel();
  },

  updateEditor(params) {
    dispatch("updateEditor", params);
  },

  async selectResultTab(query, name) {
    dispatch("selectResultTab", { id: query.id, name });

    if (name === "chart" && !query.chart) {
      const chart = await Database.Chart.findOrCreateByQueryId({
        queryId: query.id
      });
      dispatch("addChart", { chart });
    }
  },

  async updateChart(id, params) {
    const chart = await Database.Chart.update(id, params);
    dispatch("updateChart", { id, params: chart });
  }
};

export default QueryAction;
