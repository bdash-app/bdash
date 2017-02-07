import bigquery from '@google-cloud/bigquery';
import Base from './Base';
import { flatten } from 'lodash';

export default class BigQuery extends Base {
  static get key() { return 'bigquery'; }
  static get label() { return 'BigQuery'; }
  static get configSchema() {
    return [
      { name: 'project', label: 'Project', type: 'string', placeholder: 'your-project-id' },
      { name: 'keyFilename', label: 'JSON Key File', type: 'string', placeholder: '/path/to/keyfile.json' },
    ];
  }

  execute(query) {
    this._cancel = null;
    return new Promise((resolve, reject) => {
      bigquery(this.config).startQuery(query, (err, job) => {
        if (err) return reject(err);

        this._cancel = () => {
          job.cancel().then(() => reject(new Error('Query is canceled')));
        };

        job.getQueryResults((err, rows) => {
          if (err) return reject(err);
          if (rows.length === 0) return resolve({});

          resolve({
            fields: Object.keys(rows[0]),
            rows: rows.map(Object.values),
          });
        });
      });
    });
  }

  cancel() {
    return this._cancel && this._cancel();
  }

  connectionTest() {
    return bigquery(this.config).query('select 1').then(() => true);
  }

  fetchTables() {
    return bigquery(this.config).getDatasets().then(([datasets]) => {
      return Promise.all(datasets.map(dataset => {
        return dataset.getTables().then(([tables]) => {
          return tables.map(table => ({
            schema: dataset.id,
            name: table.id,
            type: table.metadata.type.toLowerCase(),
          }));
        });
      }));
    }).then(flatten);
  }

  fetchTableSummary({ schema, name }) {
    return bigquery(this.config).dataset(schema).table(name).getMetadata().then(([metadata]) => {
      let schemaFields = metadata.schema.fields;
      let defs = {
        fields: Object.keys(schemaFields[0]),
        rows: schemaFields.map(Object.values),
      };
      return { schema, name, defs };
    });
  }
}
