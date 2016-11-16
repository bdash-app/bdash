import mysql from 'mysql';
import Base from './Base';
import strings from '../utils/strings';

export default class Mysql extends Base {
  static get key() { return 'mysql'; }
  static get label() { return 'MySQL'; }

  execute(query, ...args) {
    if (this.currentConnection) {
      return Promise.reject(new Error('A query is running'));
    }

    return new Promise((resolve, reject) => {
      this.currentConnection = mysql.createConnection(this.config);
      let start = Date.now();

      this.currentConnection.query(query, args, (err, rows, fields) => {
        let runtime = Date.now() - start;
        this.currentConnection.end();
        this.currentConnection = null;

        if (err) {
          reject(err);
        }
        else {
          resolve({ fields, rows, runtime });
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
    return this.execute('select 1').then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }

  fetchTables() {
    let query = strings.stripHeredoc(`
      select table_name, table_type
      from information_schema.tables
      where table_schema = ?
      order by table_name
    `);

    return this.execute(query, this.config.database);
  }

  fetchTableSummary(tableName) {
    let sql = 'show columns from ??';

    return this.execute(sql, tableName);
  }
}
