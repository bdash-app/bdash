import mysql from "mysql2";
import Base, { ConfigSchemaType } from "./Base";
import Util from "../Util";
import { zipObject } from "lodash";
import { promises } from "fs";

export default class Mysql extends Base {
  currentConnection: any;

  static get key(): string {
    return "mysql";
  }
  static get label(): string {
    return "MySQL";
  }
  static get configSchema(): ConfigSchemaType {
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
      { name: "database", label: "Database", type: "string", required: true },
      { name: "ssl", label: "SSL", type: "checkbox" },
      { name: "sslCaFilename", label: "SSL CA File", type: "string", placeholder: "/path/to/ca.pem" },
      { name: "sslKeyFilename", label: "SSL Key File", type: "string", placeholder: "/path/to/client-key.pem" },
      { name: "sslCertFilename", label: "SSL Cirtifcate File", type: "string", placeholder: "/path/to/client-cert.pem" }
    ];
  }

  execute(query) {
    return this._execute(query);
  }

  cancel(): Promise<void> {
    const tid = this.currentConnection && this.currentConnection.threadId;
    if (!tid) return Promise.resolve();

    return new Mysql(this.config)._execute(`kill query ${tid}`);
  }

  async connectionTest() {
    await this._execute("select 1");
    return true;
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const query = Util.stripHeredoc(`
      select table_name as name, table_type as type
      from information_schema.tables
      where table_schema = ?
      order by table_name
    `);
    const { fields, rows } = await this._execute(query, this.config.database);

    return rows.map(row => zipObject(fields, row));
  }

  async fetchTableSummary({
    name
  }: {
    name: string;
  }): Promise<{ name: string; defs: { fields: string[]; rows: (string | null)[][] }; schema?: string }> {
    const sql = "show columns from ??";
    const defs = await this._execute(sql, name);

    return { name, defs };
  }

  async getConfig(): Promise<any> {
    const ssl = this.config.ssl
      ? {
          ca: this.config.sslCaFilename ? await promises.readFile(this.config.sslCaFilename) : undefined,
          key: this.config.sslKeyFilename ? await promises.readFile(this.config.sslKeyFilename) : undefined,
          cert: this.config.sslCertFilename ? await promises.readFile(this.config.sslCertFilename) : undefined,
          // Some MySQL server doesn't support TLS v1.2,
          // However default minVersion is TLSv1.2 if you use Node.js v12.0 or later.
          // @see https://github.com/nodejs/help/issues/1936
          minVersion: "TLSv1"
        }
      : undefined;
    return {
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      ssl
    };
  }

  async _execute(query: string, ...args): Promise<any> {
    if (this.currentConnection) {
      return Promise.reject(new Error("A query is running"));
    }

    const config = await this.getConfig();
    return new Promise((resolve, reject) => {
      const params = Object.assign({ dateStrings: true }, config);
      this.currentConnection = mysql.createConnection(params);
      this.currentConnection.connect(err => {
        if (err) {
          this.currentConnection.close();
          this.currentConnection = null;
          return reject(err);
        }

        this.currentConnection.query({ sql: query, values: args, rowsAsArray: true }, (err, rows, fields) => {
          this.currentConnection.close();
          this.currentConnection = null;

          if (err) {
            reject(err);
          } else if (fields && rows) {
            resolve({ fields: fields.map(f => f.name), rows });
          } else if (rows) {
            resolve({ fields: [], rows: [] });
          } else {
            // cancel query does not have result
            resolve();
          }
        });
      });
    });
  }

  descriptionTable(): string {
    return Util.stripHeredoc(`
      |host|${this.config.host}|
      |port|${this.config.port}|
      |user|${this.config.user}|
      |database|${this.config.database}|
    `);
  }
}
