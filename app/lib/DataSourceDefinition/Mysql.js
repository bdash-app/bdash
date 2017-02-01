import mysql from 'mysql2';
import Base from './Base';
import Util from '../Util';
import { zipObject } from 'lodash';

export default class Mysql extends Base {
  static get key() { return 'mysql'; }
  static get label() { return 'MySQL'; }
  static get configSchema() {
    return [
      { name: 'host', label: 'Host', type: 'string', placeholder: 'localhost' },
      { name: 'port', label: 'Port', type: 'number', placeholder: 3306 },
      { name: 'user', label: 'Username', type: 'string', placeholder: process.env.USER },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'database', label: 'Database', type: 'string', required: true },
    ];
  }

  execute(query, ...args) {
    if (this.currentConnection) {
      return Promise.reject(new Error('A query is running'));
    }

    return new Promise((resolve, reject) => {
      let params = Object.assign({ dateStrings: true }, this.config);
      this.currentConnection = mysql.createConnection(params);

      this.currentConnection.query({ sql: query, values: args, rowsAsArray: true }, (err, rows, fields) => {
        try {
          this.currentConnection.end();
        }
        catch (e) {
          // do nothing
        }
        this.currentConnection = null;

        if (err) {
          reject(err);
        }
        else {
          resolve({ fields: fields.map(f => f.name), rows });
        }
      });
    });
  }

  cancel() {
    let tid = this.currentConnection && this.currentConnection.threadId;
    if (!tid) return Promise.resolve();

    return new Mysql(this.config).execute(`kill query ${tid}`);
  }

  connectionTest() {
    return this.execute('select 1').then(() => true);
  }

  fetchTables() {
    let query = Util.stripHeredoc(`
      select table_name as name, table_type as type
      from information_schema.tables
      where table_schema = ?
      order by table_name
    `);

    return this.execute(query, this.config.database).then(({ fields, rows }) => {
      return rows.map(row => zipObject(fields, row));
    });
  }

  fetchTableSummary({ name }) {
    let sql = 'show columns from ??';

    return this.execute(sql, name).then(defs => {
      return { name, defs };
    });
  }
}
