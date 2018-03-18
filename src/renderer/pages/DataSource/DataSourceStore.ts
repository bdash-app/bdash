import Store from "../../flux/Store";

export interface DataSourceState {
  dataSources: any[];
  selectedDataSourceId: number | null;
  showForm: boolean;
  formValue: any;
}

export default class DataSourceStore extends Store<DataSourceState> {
  constructor() {
    super();
    this.state = {
      dataSources: [],
      selectedDataSourceId: null,
      showForm: false,
      formValue: null
    };
  }

  reduce(type, payload) {
    switch (type) {
      case "initialize": {
        return this.mergeList("dataSources", payload.dataSources);
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
          tableSummary: null
        });
      }
      case "selectTable": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.merge(`dataSources.${idx}`, {
          selectedTable: payload.selectedTable,
          tableSummary: payload.tableSummary
        });
      }
      case "changeTableFilter": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.set(`dataSources.${idx}.tableFilter`, payload.value);
      }
      case "showForm": {
        return this.set("showForm", true).set("formValue", payload.dataSource);
      }
      case "cancelForm": {
        return this.set("showForm", false).set("formValue", null);
      }
      case "createDataSource": {
        return this.set("showForm", false).prepend("dataSources", payload.dataSource);
      }
      case "updateDataSource": {
        const idx = this.findDataSourceIndex(payload.dataSource.id);
        return this.set("showForm", false).set(`dataSources.${idx}`, payload.dataSource);
      }
      case "deleteDataSource": {
        const idx = this.findDataSourceIndex(payload.id);
        return this.del(`dataSources.${idx}`);
      }
    }
  }

  findDataSourceIndex(id) {
    const idx = this.state.dataSources.findIndex(q => q.id === id);

    if (idx === -1) {
      throw new Error(`dataSource id:${id} not found`);
    }

    return idx;
  }
}

const { store, dispatch } = Store.create(DataSourceStore);
export { store, dispatch };
