import Setting, { SettingType } from "../../../lib/Setting";
import Store, { StateBuilder } from "../../flux/Store";
import { ChartType } from "../../../lib/Database/Chart";
import { QueryType } from "../../../lib/Database/Query";
import { DataSourceType } from "../DataSource/DataSourceStore";

export interface QueryState {
  setting: SettingType;
  queries: QueryType[];
  dataSources: DataSourceType[];
  charts: ChartType[];
  selectedQueryId: number | null;
  editor: {
    height: number | null;
    line: number | null;
  };
}

export default class QueryStore extends Store<QueryState> {
  constructor() {
    super();
    this.state = {
      setting: Setting.getDefault(),
      queries: [],
      dataSources: [],
      charts: [],
      selectedQueryId: null,
      editor: {
        height: null,
        line: null,
      },
    };
  }

  reduce(type: string, payload: any): StateBuilder<QueryState> {
    switch (type) {
      case "initialize": {
        return this.merge("setting", payload.setting)
          .mergeList("queries", payload.queries)
          .mergeList("charts", payload.charts)
          .mergeList("dataSources", payload.dataSources);
      }
      case "selectQuery": {
        const idx = this.findQueryIndex(payload.id);
        return this.set("selectedQueryId", payload.id).set("editor.line", null).merge(`queries.${idx}`, payload.query);
      }
      case "addNewQuery": {
        return this.set("selectedQueryId", payload.query.id).set("editor.line", null).prepend("queries", payload.query);
      }
      case "updateQuery": {
        const idx = this.findQueryIndex(payload.id);
        return this.merge(`queries.${idx}`, payload.params);
      }
      case "deleteQuery": {
        const idx = this.findQueryIndex(payload.id);
        return this.set("selectedQueryId", null).set("editor.line", null).del(`queries.${idx}`);
      }
      case "updateEditor": {
        return this.merge("editor", payload);
      }
      case "selectResultTab": {
        const idx = this.findQueryIndex(payload.id);
        return this.set(`queries.${idx}.selectedTab`, payload.name);
      }
      case "addChart": {
        return this.append("charts", payload.chart);
      }
      case "updateChart": {
        const idx = this.findChartIndex(payload.id);
        return this.merge(`charts.${idx}`, payload.params);
      }
      default: {
        throw new Error("Invalid type");
      }
    }
  }

  findQueryIndex(id: number): number {
    const idx = this.state.queries.findIndex((q) => q.id === id);

    if (idx === -1) {
      throw new Error(`query id:${id} not found`);
    }

    return idx;
  }

  findChartIndex(id: number): number {
    const idx = this.state.charts.findIndex((c) => c.id === id);

    if (idx === -1) {
      throw new Error(`chart id:${id} not found`);
    }

    return idx;
  }
}

const { store, dispatch } = Store.create<QueryState>(QueryStore);
export { store, dispatch };
