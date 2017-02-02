import { dispatch } from './DataSourceStore';
import Database from '../../../lib/Database';
import DataSource from '../../../lib/DataSource';

const DataSourceAction = {
  initialize() {
    Database.DataSource.getAll().then(dataSources => {
      dispatch('initialize', { dataSources });
    });
  },

  selectDataSource(dataSource) {
    dispatch('selectDataSource', { id: dataSource.id });
    DataSourceAction.loadTables(dataSource);
  },

  loadTables(dataSource) {
    DataSource.create(dataSource).fetchTables().then(tables => {
      dispatch('reloadTables', { id: dataSource.id, tables });
    });
  },

  selectTable(dataSource, table) {
    DataSource.create(dataSource).fetchTableSummary(table).then(tableSummary => {
      dispatch('selectTable', { id: dataSource.id, selectedTable: table, tableSummary });
    });
  },

  changeTableFilter(dataSource, value) {
    dispatch('changeTableFilter', { id: dataSource.id, value });
  },

  createDataSource({ name, type, config }) {
    Database.DataSource.create({ name, type, config }).then(dataSource => {
      dispatch('createDataSource', { dataSource });
      DataSourceAction.selectDataSource(dataSource);
    });
  },

  updateDataSource({ id, name, type, config }) {
    Database.DataSource.update(id, { name, type, config }).then(dataSource => {
      dispatch('updateDataSource', { dataSource });
      DataSourceAction.loadTables(dataSource);
    });
  },

  deleteDataSource(id) {
    Database.DataSource.del(id).then(() => {
      dispatch('deleteDataSource', { id });
    });
  },

  showForm(dataSource = null) {
    dispatch('showForm', { dataSource });
  },

  hideForm() {
    dispatch('cancelForm');
  },
};

export default DataSourceAction;
