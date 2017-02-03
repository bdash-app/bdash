import moment from 'moment';
import { dispatch } from './QueryStore';
import { setting } from '../../../lib/Setting';
import Database from '../../../lib/Database';
import Util from '../../../lib/Util';
import DataSource from '../../../lib/DataSource';

const DEFAULT_QUERY_TITLE = 'New Query';

const QueryAction = {
  initialize() {
    Promise.all([
      Database.Query.getAll(),
      Database.DataSource.getAll(),
      Database.Chart.getAll(),
    ]).then(([queries, dataSources, charts]) => {
      dispatch('initialize', { queries, dataSources, charts, setting: setting.load() });
    });
  },

  selectQuery(query) {
    let id = query.id;
    if (query.body === undefined) {
      Database.Query.find(id).then(query => {
        dispatch('selectQuery', { id, query });
      });
    }
    else {
      dispatch('selectQuery', { id, query: {} });
    }
  },

  addNewQuery({ dataSourceId }) {
    Database.Query.create({ title: DEFAULT_QUERY_TITLE, dataSourceId }).then(query => {
      dispatch('addNewQuery', { query });
    });
  },

  updateQuery(id, params) {
    dispatch('updateQuery', { id, params });
    Database.Query.update(id, params);
  },

  deleteQuery(id) {
    Database.Query.del(id).then(() => {
      dispatch('deleteQuery', { id });
    });
  },

  executeQuery({ line, query, dataSource }) {
    let queryBody = Util.findQueryByLine(query.body, line);
    let executor = DataSource.create(dataSource);
    let id = query.id;
    dispatch('updateQuery', { id, params: { status: 'working', executor } });

    let start = Date.now();
    executor.execute(queryBody).then(({ fields, rows }) => {
      let params = {
        status: 'success',
        fields: fields,
        rows: rows,
        runtime: Date.now() - start,
        runAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
        errorMessage: null,
      };
      dispatch('updateQuery', { id, params: Object.assign({ executor: null }, params) });
      Database.Query.update(id, Object.assign(params, {
        fields: JSON.stringify(params.fields),
        rows: JSON.stringify(params.rows),
      }));
    }).catch(err => {
      let params = {
        status: 'failure',
        fields: null,
        rows: null,
        runtime: null,
        errorMessage: err.message,
      };
      dispatch('updateQuery', { id, params: Object.assign({ executor: null }, params) });
      Database.Query.update(id, params);
    });
  },

  cancelQuery(query) {
    dispatch('updateQuery', { id: query.id, params: { executor: null } });
    query.executor.cancel();
  },

  updateEditor(params) {
    dispatch('updateEditor', params);
  },

  selectResultTab(query, name) {
    dispatch('selectResultTab', { id: query.id, name });

    if (name === 'chart' && !query.chart) {
      Database.Chart.findOrCreateByQueryId({ queryId: query.id }).then(chart => {
        dispatch('addChart', { chart });
      });
    }
  },

  updateChart(id, params) {
    Database.Chart.update(id, params).then(chart => {
      dispatch('updateChart', { id, params: chart });
    });
  },
};

export default QueryAction;
