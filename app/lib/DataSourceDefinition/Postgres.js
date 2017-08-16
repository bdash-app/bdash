import pg from 'pg';
import Base from './Base';
import Util from '../Util';
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
  static get configSchema() {
    return [
      { name: 'host', label: 'Host', type: 'string', placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', placeholder: 5432 },
      { name: 'user', label: 'Username', type: 'string', placeholder: process.env.USER },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'database', label: 'Database', type: 'string', required: true },
      { name: 'ssl', label: 'SSL', type: 'checkbox' },
    ];
  }

  async execute(query, options = {}) {
    try {
      return await this._execute(query);
    }
    catch (err) {
      throw this._errorWithLine(err, query, options.startLine || 1);
    }
  }

  cancel() {
    let pid = this.currentClient && this.currentClient.processID;
    if (!pid) return Promise.resolve();

    return new Postgres(this.config)._execute(`select pg_cancel_backend(${pid})`);
  }

  async connectionTest() {
    await this._execute('select 1');
    return true;
  }

  async fetchTables() {
    let query = Util.stripHeredoc(`
      select table_schema as schema, table_name as name, table_type as type
      from information_schema.tables
      where table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')
      order by table_schema, table_name
    `);
    let { fields, rows } = await this._execute(query);

    return rows.map(row => zipObject(fields, row));
  }

  async fetchTableSummary({ schema, name }) {
    let query = Util.stripHeredoc(`
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
    let defs = await this._execute(query, `${schema}.${name}`);

    return { schema, name, defs };
  }

  _execute(query, ...args) {
    if (this.currentClient) {
      return Promise.reject(new Error('A query is running'));
    }

    return new Promise((resolve, reject) => {
      this.currentClient = new pg.Client(this.config);
      this.currentClient.connect(err => {
        if (err) {
          this.currentClient.end();
          this.currentClient = null;
          return reject(err);
        }

        this.currentClient.query({ text: query, values: args, rowMode: 'array' }, (err, result) => {
          this.currentClient.end();
          this.currentClient = null;

          if (err) {
            reject(err);
          }
          else {
            let { rows, fields } = result;
            resolve({ fields: fields.map(f => f.name), rows });
          }
        });
      });
    });
  }

  _errorWithLine(err, query, startLine) {
    if (!err.position) return err;

    let message = err.message;
    if (err.position) {
      let line = (query.substring(0, err.position).match(/\n/g) || []).length + startLine;
      message += ` (line: ${line})`;
    }

    return new Error(message);
  }

  description() {
    return Util.stripHeredoc(`
      host: ${this.config.host}
      port: ${this.config.port}
      user: ${this.config.user}
      database: ${this.config.database}
    `);
  }
}
