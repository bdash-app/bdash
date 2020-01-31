import sqlite3 from "sqlite3";
import Base, { ConfigSchemasType } from "./Base";
import Util from "../Util";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";

export default class SQLite3 extends Base {
  db: sqlite3.Database | null;

  static get key(): DataSourceKeys {
    return "sqlite3";
  }
  static get label(): string {
    return "SQLite3";
  }
  static get configSchema(): ConfigSchemasType {
    return [{ name: "path", label: "Path", type: "string", placeholder: "/path/to/db.sqlite3" }];
  }

  execute(query: string): Promise<any> {
    return this._execute(query);
  }

  cancel(): void {
    this.db?.interrupt();
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const { rows }: any = await this._execute("select tbl_name from sqlite_master where type = 'table'");
    if (!rows) {
      return Promise.resolve([]);
    }
    return rows.map(row => {
      return { name: row[0], type: "table" };
    });
  }

  async fetchTableSummary({
    name
  }: {
    name: string;
  }): Promise<{ name: string; defs: { fields: string[]; rows: (string | null)[][] }; schema?: string }> {
    const defs = await this._execute(`pragma table_info(${name})`);

    return { name, defs };
  }

  async connectionTest(): Promise<any> {
    return this._execute("select 1");
  }

  _execute(query: string): Promise<{ rows: (string | null)[][]; fields: string[] }> {
    this.db = new sqlite3.Database(this.config.path);
    return new Promise((resolve, reject) => {
      this.db?.all(query, (err, results) => {
        this.db?.close();
        this.db = null;
        if (err) {
          return reject(err);
        }
        if (results.length === 0) {
          return resolve({ rows: [], fields: [] });
        }
        const fields = Object.keys(results[0]);
        const rows = results.map<(string | null)[]>(r => Object.values(r));
        resolve({ fields, rows });
      });
    });
  }

  descriptionTable(): string {
    return Util.stripHeredoc(`
      |path|${this.config.path}|
    `);
  }
}
