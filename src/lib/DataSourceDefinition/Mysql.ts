import * as mysql from "mysql2";
import Base from "./Base";
import Util from "../Util";
import { zipObject } from "lodash";

export default class Mysql extends Base {
  currentConnection: any; // eslint-disable-line no-undef

  static get key() {
    return "mysql";
  }
  static get label() {
    return "MySQL";
  }
  static get configSchema() {
    return [
      { name: "host", label: "Host", type: "string", placeholder: "localhost" },
      { name: "port", label: "Port", type: "number", placeholder: 3306 },
      {
        name: "user",
        label: "Username",
        type: "string",
        placeholder: process.env.USER
      },
      { name: "password", label: "Password", type: "password" },
      { name: "database", label: "Database", type: "string", required: true }
    ];
  }

  execute(query) {
    return this._execute(query);
  }

  cancel() {
    const tid = this.currentConnection && this.currentConnection.threadId;
    if (!tid) return Promise.resolve();

    return new Mysql(this.config)._execute(`kill query ${tid}`);
  }

  async connectionTest() {
    await this._execute("select 1");
    return true;
  }

  async fetchTables() {
    const query = Util.stripHeredoc(`
      select table_name as name, table_type as type
      from information_schema.tables
      where table_schema = ?
      order by table_name
    `);
    const { fields, rows } = await this._execute(query, this.config.database);

    return rows.map(row => zipObject(fields, row));
  }

  async fetchTableSummary({ name }) {
    const sql = "show columns from ??";
    const defs = await this._execute(sql, name);

    return { name, defs };
  }

  _execute(query, ...args): Promise<any> {
    if (this.currentConnection) {
      return Promise.reject(new Error("A query is running"));
    }

    return new Promise((resolve, reject) => {
      const params = Object.assign({ dateStrings: true }, this.config);
      this.currentConnection = mysql.createConnection(params);
      this.currentConnection.connect(err => {
        if (err) {
          this.currentConnection.close();
          this.currentConnection = null;
          return reject(err);
        }

        this.currentConnection.query(
          { sql: query, values: args, rowsAsArray: true },
          (err, rows, fields) => {
            this.currentConnection.close();
            this.currentConnection = null;

            if (err) {
              reject(err);
            } else if (fields && rows) {
              resolve({ fields: fields.map(f => f.name), rows });
            } else {
              // cancel query does not have result
              resolve();
            }
          }
        );
      });
    });
  }
}
