import sqlite3 from "sqlite3";
import Base from "./Base";
import Util from "../Util";

export default class SQLite3 extends Base {
  db: sqlite3.Database | null;

  static get key() {
    return "sqlite3";
  }
  static get label() {
    return "SQLite3";
  }
  static get configSchema() {
    return [{ name: "path", label: "Path", type: "string", placeholder: "/path/to/db.sqlite3" }];
  }

  execute(query) {
    return this._execute(query);
  }

  async cancel() {
    this.db.interrupt();
  }

  async fetchTables() {
    const { rows }: any = await this._execute("select tbl_name from sqlite_master where type = 'table'");
    return rows.map(row => {
      return { name: row[0], type: "table" };
    });
  }

  async fetchTableSummary({ name }) {
    const defs = await this._execute(`pragma table_info(${name})`);

    return { name, defs };
  }

  async connectionTest() {
    return this._execute("select 1");
  }

  _execute(query) {
    this.db = new sqlite3.Database(this.config.path);
    return new Promise((resolve, reject) => {
      this.db.all(query, (err, results) => {
        this.db.close();
        this.db = null;
        if (err) {
          return reject(err);
        }
        if (results.length === 0) {
          return resolve([]);
        }
        const fields = Object.keys(results[0]);
        const rows = results.map(r => Object.values(r));
        resolve({ fields, rows });
      });
    });
  }

  descriptionTable() {
    return Util.stripHeredoc(`
      |path|${this.config.path}|
    `);
  }
}
