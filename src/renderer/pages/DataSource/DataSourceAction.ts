import { dispatch, DataSourceType, TableType } from "./DataSourceStore";
import Database from "../../../lib/Database";
import DataSource from "../../../lib/DataSource";
import { setting } from "../../../lib/Setting";

const DataSourceAction = {
  async initialize(): Promise<void> {
    const dataSources = await Database.DataSource.getAll();
    dispatch("initialize", { dataSources, setting: setting.load() });
  },

  async selectDataSource(dataSource: DataSourceType): Promise<void> {
    dispatch("selectDataSource", { id: dataSource.id });
    await DataSourceAction.loadTables(dataSource);
  },

  async loadTables(dataSource: DataSourceType): Promise<void> {
    let tables;
    try {
      tables = await DataSource.create(dataSource).fetchTables();
    } catch (e) {
      dispatch("setErrorFetchingTables", { id: dataSource.id, error: e });
      return;
    }
    dispatch("reloadTables", { id: dataSource.id, tables });
  },

  reloadTables(dataSource: DataSourceType): void {
    dispatch("clearTables", { id: dataSource.id });
    DataSourceAction.loadTables(dataSource);
  },

  async selectTable(dataSource: DataSourceType, table: TableType): Promise<void> {
    const tableSummary = await DataSource.create(dataSource).fetchTableSummary(table);
    dispatch("selectTable", {
      id: dataSource.id,
      selectedTable: table,
      tableSummary
    });
  },

  changeTableFilter(dataSource: DataSourceType, value: string): void {
    dispatch("changeTableFilter", { id: dataSource.id, value });
  },

  async createDataSource({ name, type, config }: Pick<DataSourceType, "name" | "type" | "config">): Promise<void> {
    const dataSource = await Database.DataSource.create({ name, type, config });
    dispatch("createDataSource", { dataSource });
    DataSourceAction.selectDataSource(dataSource);
  },

  async updateDataSource({
    id,
    name,
    type,
    config
  }: Pick<DataSourceType, "id" | "name" | "type" | "config">): Promise<void> {
    const dataSource = await Database.DataSource.update(id, {
      name,
      type,
      config
    });
    dispatch("updateDataSource", { dataSource });
    DataSourceAction.loadTables(dataSource);
  },

  async deleteDataSource(id: number): Promise<void> {
    await Database.DataSource.del(id);
    dispatch("deleteDataSource", { id });
  },

  showForm(dataSource: DataSourceType | null = null): void {
    dispatch("showForm", { dataSource });
  },

  hideForm(): void {
    dispatch("cancelForm");
  },

  updateDefaultDataSourceId(defaultDataSourceId: number): void {
    setting.save({ defaultDataSourceId });
    dispatch("updateDefaultDataSourceId", { defaultDataSourceId });
  }
};

export default DataSourceAction;
