import Store, { StateBuilder } from "../../flux/Store";
import Setting, { SettingType } from "../../../lib/Setting";
import { TableSummary } from "../../../lib/DataSourceDefinition/Base";

export type DataSourceKeys =
  | "athena"
  | "bigquery"
  | "databricks"
  | "mysql"
  | "postgres"
  | "redshift"
  | "sqlite3"
  | "treasuredata"
  | "timestream";

export type DataSourceType = {
  readonly id: number;
  readonly name: string;
  readonly type: DataSourceKeys;
  readonly config: { [name: string]: any };
  readonly mimeType: string;
  readonly tables: TableType[];
  readonly selectedTable: TableType;
  readonly tableSummary: TableSummary;
  readonly tableFilter: string;
  readonly tableFetchingError: string | null;
};

export type TableType = {
  readonly name: string;
  readonly type: string;
  readonly schema?: string;
};

export interface DataSourceState {
  dataSources: DataSourceType[];
  selectedDataSourceId: number | null;
  showForm: boolean;
  formValue: DataSourceType | null;
  formValidationError: string | null;
  setting: SettingType;
}

export default class DataSourceStore extends Store<DataSourceState> {
  constructor() {
    super();
    this.state = {
      dataSources: [],
      selectedDataSourceId: null,
      showForm: false,
      formValue: null,
      formValidationError: null,
      setting: Setting.getDefault(),
    };
  }

  override reduce(type: string, payload: any): StateBuilder<DataSourceState> {
    switch (type) {
      case "initialize": {
        return this.merge("setting", payload.setting).mergeList("dataSources", payload.dataSources);
      }
      case "selectDataSource": {
        return this.set("selectedDataSourceId", payload.id);
      }
      case "setTables": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.set(`dataSources.${idx}.tables`, payload.tables);
      }
      case "reloadTables": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.merge(`dataSources.${idx}`, {
          tables: payload.tables,
          selectedTable: null,
          tableSummary: null,
          tableFetchingError: null,
        });
      }
      case "clearTables": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.merge(`dataSources.${idx}`, {
          tables: null,
          selectedTable: null,
          tableSummary: null,
          tableFetchingError: null,
        });
      }
      case "setErrorFetchingTables": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.merge(`dataSources.${idx}`, {
          tableFetchingError: payload.error.message,
        });
      }
      case "selectTable": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.merge(`dataSources.${idx}`, {
          selectedTable: payload.selectedTable,
          tableSummary: payload.tableSummary,
        });
      }
      case "changeTableFilter": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.set(`dataSources.${idx}.tableFilter`, payload.value);
      }
      case "showForm": {
        return this.set("showForm", true).set("formValue", payload.dataSource).set("formValidationError", null);
      }
      case "cancelForm": {
        return this.set("showForm", false).set("formValue", null).set("formValidationError", null);
      }
      case "setFormValidationError": {
        return this.set("formValidationError", payload.error);
      }
      case "createDataSource": {
        return this.set("showForm", false).set("formValidationError", null).prepend("dataSources", payload.dataSource);
      }
      case "updateDataSource": {
        const idx = this.findDataSourceIndex(payload.dataSource.id);
        return this.set("showForm", false)
          .set("formValidationError", null)
          .set(`dataSources.${idx}`, payload.dataSource);
      }
      case "deleteDataSource": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.del(`dataSources.${idx}`);
      }
      case "updateDefaultDataSourceId": {
        return this.set("setting.defaultDataSourceId", payload.defaultDataSourceId);
      }
      default: {
        throw new Error("Invalid type");
      }
    }
  }

  findDataSourceIndex(id: number): number {
    const idx = this.state.dataSources.findIndex((q) => q.id === id);

    if (idx === -1) {
      throw new Error(`dataSource id:${id} not found`);
    }

    return idx;
  }
}

const { store, dispatch } = Store.create<DataSourceState>(DataSourceStore);
export { store, dispatch };
