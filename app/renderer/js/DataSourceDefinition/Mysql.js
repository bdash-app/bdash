import mysql from 'mysql';
import Base from './Base';
import strings from '../utils/strings';

export default class Mysql extends Base {
  static get key() { return 'mysql'; }
  static get label() { return 'MySQL'; }

  execute(query, ...args) {
    return new Promise((resolve, reject) => {
      let connection = mysql.createConnection(this.config);
      let start = Date.now();

      connection.query(query, args, (err, rows, fields) => {
        let runtime = Date.now() - start;
        connection.end();

        if (err) {
          reject(err);
        }
        else {
          resolve({ fields, rows, runtime });
        }
      });
    });
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
