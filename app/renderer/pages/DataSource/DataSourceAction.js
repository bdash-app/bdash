import { dispatch } from './DataSourceStore';
import Database from '../../../lib/Database';
import DataSource from '../../../lib/DataSource';

const DataSourceAction = {
  async initialize() {
    let dataSources = await Database.DataSource.getAll();
    dispatch('initialize', { dataSources });
  },

  selectDataSource(dataSource) {
    dispatch('selectDataSource', { id: dataSource.id });
    DataSourceAction.loadTables(dataSource);
  },

  async loadTables(dataSource) {
    let tables = await DataSource.create(dataSource).fetchTables();
    dispatch('reloadTables', { id: dataSource.id, tables });
  },

  async selectTable(dataSource, table) {
    let tableSummary = await DataSource.create(dataSource).fetchTableSummary(table);
    dispatch('selectTable', { id: dataSource.id, selectedTable: table, tableSummary });
  },

  changeTableFilter(dataSource, value) {
    dispatch('changeTableFilter', { id: dataSource.id, value });
  },

  async createDataSource({ name, type, config }) {
    let dataSource = await Database.DataSource.create({ name, type, config });
    dispatch('createDataSource', { dataSource });
    DataSourceAction.selectDataSource(dataSource);
  },

  async updateDataSource({ id, name, type, config }) {
    let dataSource = await Database.DataSource.update(id, { name, type, config });
    dispatch('updateDataSource', { dataSource });
    DataSourceAction.loadTables(dataSource);
  },

  async deleteDataSource(id) {
    await Database.DataSource.del(id);
    dispatch('deleteDataSource', { id });
  },

  showForm(dataSource = null) {
    dispatch('showForm', { dataSource });
  },

  hideForm() {
    dispatch('cancelForm');
  },
};

export default DataSourceAction;
