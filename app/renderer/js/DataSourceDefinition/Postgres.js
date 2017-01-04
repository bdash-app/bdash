import pg from 'pg';
import Base from './Base';
import strings from '../utils/strings';
import { zipObject } from 'lodash';

// Disable auto convert
// https://github.com/brianc/node-pg-types/blob/ed2d0e36e33217b34530727a98d20b325389e73a/lib/textParsers.js#L147-L149
[
  20, 21, 23, 26, 700, 701, 16, 1082, 1114, 1184, 600, 718, 1000, 1001,
  1005, 1007, 1028, 1016, 1021, 1022, 1231, 1014, 1015, 1008, 1009, 1115,
  1182, 1185, 1186, 17, 114, 3802, 199, 3807, 2951, 791, 1183,
].forEach(n => {
  pg.types.setTypeParser(n, v => v);
});

export default class Postgres extends Base {
  static get key() { return 'postgres'; }
  static get label() { return 'PostgreSQL'; }

  execute(query, ...args) {
    if (this.currentClient) {
      return Promise.reject(new Error('A query is running'));
    }

    return new Promise((resolve, reject) => {
      this.currentClient = new pg.Client(this.config);
      this.currentClient.connect(err => {
        if (err) {
          this.currentClient = null;
          return reject(err);
        }

        this.currentClient.query({ text: query, values: args, rowMode: 'array' }, (err, result) => {
          this.currentClient.end();
          this.currentClient = null;

          if (err) {
            reject(this._createError(query, err));
          }
          else {
            let { rows, fields } = result;
            resolve({ fields: fields.map(f => f.name), rows });
          }
        });
      });
    });
  }

  cancel() {
    let pid = this.currentClient && this.currentClient.processID;
    if (!pid) return Promise.resolve();

    return new Postgres(this.config).execute(`select pg_cancel_backend(${pid})`);
  }

  connectionTest() {
    return this.execute('select 1').then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }

  fetchTables() {
    let query = strings.stripHeredoc(`
      select table_schema, table_name, table_type
      from information_schema.tables
      where table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')
      order by table_schema, table_name
    `);

    return this.execute(query).then(({ fields, rows }) => {
      return rows.map(row => zipObject(fields, row));
    });
  }

  fetchTableSummary(tableName) {
    let query = strings.stripHeredoc(`
      select
          pg_attribute.attname as name,
          pg_attribute.atttypid::regtype as type,
          case pg_attribute.attnotnull when true then 'NO' else 'YES' end as null,
          pg_attrdef.adsrc as default_value,
          pg_description.description as description
      from
          pg_attribute
          left join pg_description on
              pg_description.objoid = pg_attribute.attrelid
              and pg_description.objsubid = pg_attribute.attnum
          left join pg_attrdef on
              pg_attrdef.adrelid = pg_attribute.attrelid
              and pg_attrdef.adnum = pg_attribute.attnum
      where
          pg_attribute.attrelid = $1::regclass
          and not pg_attribute.attisdropped
          and pg_attribute.attnum > 0
      order by pg_attribute.attnum`
    );

    return this.execute(query, tableName);
  }

  _createError(query, err) {
    let message = err.message;

    if (err.position) {
      let line = (query.substring(0, err.position).match(/\n/g) || []).length + 1;
      message += ` (line: ${line})`;
    }

    return new Error(message);
  }
}
