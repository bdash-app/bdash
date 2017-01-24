import { dispatch } from './QueryStore';
import { setting } from '../../../domain/Setting';
import Database from '../../../domain/Database';

const DEFAULT_QUERY_TITLE = 'New Query';

export default {
  initialize() {
    Promise.all([
      Database.Query.getAll(),
      Database.DataSource.getAll(),
    ]).then(([queries, dataSources]) => {
      dispatch('initialize', { queries, dataSources, setting: setting.load() });
    });
  },

  selectQuery(id) {
    Database.Query.find(id).then(query => {
      dispatch('selectQuery', { id, query });
    });
  },

  addNewQuery({ dataSourceId }) {
    let params = {
      title: DEFAULT_QUERY_TITLE,
      dataSourceId: dataSourceId,
    };

    Database.Query.create(params).then(query => {
      dispatch('addNewQuery', { query });
    });
  },

  updateQuery(id, params) {
    Database.Query.update(id, params).then(() => {
      dispatch('updateQuery', { id, params });
    });
  },

  deleteQuery(id) {
    Database.Query.del(id).then(() => {
      dispatch('deleteQuery', { id });
    });
  },
};
