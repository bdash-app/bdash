import { DataSource } from "./database.js";

export interface TableInfo {
  name: string;
  type: string;
  schema?: string;
}

export interface TableSchema {
  fields: string[];
  rows: (string | null)[][];
}

export interface TableSummary {
  name: string;
  schema?: string;
  defs: TableSchema;
}

function stripHeredoc(str: string): string {
  str = str.trim();
  const margins = (str.match(/^ +/gm) ?? []).map((s) => s.length);
  const margin = Math.min(...margins);
  return str.replace(new RegExp(`^ {${margin}}`, "gm"), "");
}

export abstract class SchemaFetcher {
  protected config: any;

  constructor(config: any) {
    this.config = config;
  }

  abstract fetchTables(): Promise<TableInfo[]>;
  abstract fetchTableSummary(tableInfo: Partial<TableInfo>): Promise<TableSummary>;

  static create(dataSource: DataSource): SchemaFetcher {
    switch (dataSource.type) {
      case "mysql":
        return new MySQLSchemaFetcher(dataSource.config);
      case "postgres":
        return new PostgresSchemaFetcher(dataSource.config);
      case "redshift":
        return new RedshiftSchemaFetcher(dataSource.config);
      case "sqlite3":
        return new SQLite3SchemaFetcher(dataSource.config);
      case "bigquery":
        return new BigQuerySchemaFetcher(dataSource.config);
      case "databricks":
        return new DatabricksSchemaFetcher(dataSource.config);
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  }
}

class MySQLSchemaFetcher extends SchemaFetcher {
  async fetchTables(): Promise<TableInfo[]> {
    const mysql = await import("mysql2");

    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
      });

      const query = stripHeredoc(`
        select table_name as name, table_type as type
        from information_schema.tables
        where table_schema = ?
        order by table_name
      `);

      connection.query(
        { sql: query, values: [this.config.database], rowsAsArray: true },
        (err: any, rows: any, fields: any) => {
          connection.end();
          if (err) {
            reject(err);
          } else {
            const fieldNames = fields.map((f: any) => f.name);
            const tables = (rows as any[][]).map((row) => {
              const obj: any = {};
              fieldNames.forEach((field: string, i: number) => {
                obj[field] = row[i];
              });
              return obj;
            });
            resolve(tables);
          }
        }
      );
    });
  }

  async fetchTableSummary({ name }: Partial<TableInfo>): Promise<TableSummary> {
    const mysql = await import("mysql2");

    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
      });

      const sql = "show columns from ??";
      connection.query({ sql, values: [name], rowsAsArray: true }, (err: any, rows: any, fields: any) => {
        connection.end();
        if (err) {
          reject(err);
        } else {
          const defs = {
            fields: fields.map((f: any) => f.name),
            rows: rows as (string | null)[][],
          };
          resolve({ name: name!, defs });
        }
      });
    });
  }
}

class PostgresSchemaFetcher extends SchemaFetcher {
  async fetchTables(): Promise<TableInfo[]> {
    const pg = await import("pg");

    return new Promise((resolve, reject) => {
      const client = new pg.Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
      });

      const query = stripHeredoc(`
        select table_schema as schema, table_name as name, table_type as type
        from information_schema.tables
        where table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')
        order by table_schema, table_name
      `);

      client.connect((err) => {
        if (err) {
          return reject(err);
        }

        client.query({ text: query, rowMode: "array" }, (err, result) => {
          client.end();
          if (err) {
            reject(err);
          } else {
            const tables = result.rows.map((row) => {
              const obj: any = {};
              result.fields.forEach((field, i) => {
                obj[field.name] = row[i];
              });
              return obj;
            });
            resolve(tables);
          }
        });
      });
    });
  }

  async fetchTableSummary({ schema, name }: Partial<TableInfo>): Promise<TableSummary> {
    const pg = await import("pg");

    return new Promise((resolve, reject) => {
      const client = new pg.Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
      });

      const query = stripHeredoc(`
        select
            pg_attribute.attname as name,
            pg_attribute.atttypid::regtype as type,
            case pg_attribute.attnotnull when true then 'NO' else 'YES' end as null,
            pg_get_expr(pg_attrdef.adbin, pg_attrdef.adrelid) as default_value,
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
        order by pg_attribute.attnum
      `);

      client.connect((err) => {
        if (err) {
          return reject(err);
        }

        client.query({ text: query, values: [`${schema}.${name}`], rowMode: "array" }, (err, result) => {
          client.end();
          if (err) {
            reject(err);
          } else {
            const defs = {
              fields: result.fields.map((f) => f.name),
              rows: result.rows as (string | null)[][],
            };
            resolve({ schema, name: name!, defs });
          }
        });
      });
    });
  }
}

class RedshiftSchemaFetcher extends PostgresSchemaFetcher {
  override async fetchTables(): Promise<TableInfo[]> {
    const pg = await import("pg");

    return new Promise((resolve, reject) => {
      const client = new pg.Client({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : undefined,
      });

      const query = stripHeredoc(`
        select * from (
            select
                table_schema :: varchar(256) as schema
                , table_name :: varchar(256) as name
                , table_type :: varchar(256) as type
            from
                information_schema.tables
            where
                table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')

            union all

            select
                schemaname as schema
                , tablename as name
                , 'BASE TABLE' as type
            from
                pg_catalog.svv_external_tables
        )
        order by schema, name;
      `);

      client.connect((err) => {
        if (err) {
          return reject(err);
        }

        client.query({ text: query, rowMode: "array" }, (err, result) => {
          client.end();
          if (err) {
            reject(err);
          } else {
            const tables = result.rows.map((row) => {
              const obj: any = {};
              result.fields.forEach((field, i) => {
                obj[field.name] = row[i];
              });
              return obj;
            });
            resolve(tables);
          }
        });
      });
    });
  }
}

class SQLite3SchemaFetcher extends SchemaFetcher {
  async fetchTables(): Promise<TableInfo[]> {
    const sqlite3 = await import("sqlite3");

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.config.path, (err) => {
        if (err) {
          return reject(err);
        }
      });

      db.all("select tbl_name from sqlite_master where type = 'table'", (err, rows: any[]) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          const tables = rows.map((row) => ({
            name: row.tbl_name,
            type: "table",
          }));
          resolve(tables);
        }
      });
    });
  }

  async fetchTableSummary({ name }: Partial<TableInfo>): Promise<TableSummary> {
    const sqlite3 = await import("sqlite3");

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.config.path, (err) => {
        if (err) {
          return reject(err);
        }
      });

      db.all(`pragma table_info(${name})`, (err, rows: any[]) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          if (rows.length === 0) {
            resolve({ name: name!, defs: { fields: [], rows: [] } });
          } else {
            const fields = Object.keys(rows[0]);
            const rowsArray = rows.map((r) => Object.values(r) as (string | null)[]);
            resolve({ name: name!, defs: { fields, rows: rowsArray } });
          }
        }
      });
    });
  }
}

class BigQuerySchemaFetcher extends SchemaFetcher {
  async fetchTables(): Promise<TableInfo[]> {
    const { BigQuery } = await import("@google-cloud/bigquery");
    const client = new BigQuery(this.config);

    const [datasets] = await client.getDatasets();
    const results: TableInfo[] = [];

    for (const dataset of datasets) {
      const [tables] = await dataset.getTables();
      for (const table of tables) {
        results.push({
          schema: dataset.id ?? "",
          name: table.id ?? "",
          type: table.metadata.type.toLowerCase(),
        });
      }
    }

    return results;
  }

  async fetchTableSummary({ schema, name }: Partial<TableInfo>): Promise<TableSummary> {
    const { BigQuery } = await import("@google-cloud/bigquery");
    const client = new BigQuery(this.config);

    const [metadata] = await client.dataset(schema!).table(name!).getMetadata();

    const rows = this._tableSummaryRows(metadata.schema.fields);
    const defs = {
      fields: ["name", "type", "mode", "description"],
      rows,
    };

    return { schema, name: name!, defs };
  }

  private _tableSummaryRows(fields: any[], indent = 0): (string | null)[][] {
    const rows: (string | null)[][] = [];

    fields.forEach((field) => {
      let name = field.name;
      name = " ".repeat(indent * 4) + name;
      rows.push([name, field.type, field.mode, field.description || null]);
      if (field.fields) {
        rows.push(...this._tableSummaryRows(field.fields, indent + 1));
      }
    });

    return rows;
  }
}

class DatabricksSchemaFetcher extends SchemaFetcher {
  private async createClient() {
    const axios = await import("axios");
    return axios.default.create({
      baseURL: `https://${this.config.serverHostname}/api/2.0`,
      headers: {
        Authorization: `Bearer ${this.config.personalAccessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  private extractWarehouseId(): string {
    const match = this.config.httpPath.match(/\/warehouses\/([^/]+)/);
    if (!match) {
      throw new Error("Could not extract warehouse ID from HTTP path");
    }
    return match[1];
  }

  private async executeQuery(query: string): Promise<{ fields: string[]; rows: any[][] }> {
    const client = await this.createClient();
    const catalog = this.config.catalog || "main";
    const schema = this.config.schema || "default";

    const executeResponse = await client.post("/sql/statements", {
      statement: query,
      warehouse_id: this.extractWarehouseId(),
      catalog,
      schema,
      wait_timeout: "10s",
    });

    const statementId = executeResponse.data.statement_id;

    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const response = await client.get(`/sql/statements/${statementId}`);
      const data = response.data;

      if (data.status.state === "SUCCEEDED") {
        const fields = data.manifest.schema.columns.map((col: any) => col.name);
        const rows = data.result.data_array || [];
        return { fields, rows };
      }

      if (data.status.state === "FAILED" || data.status.state === "CANCELED") {
        throw new Error(`Query failed: ${JSON.stringify(data)}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error("Query timed out");
  }

  async fetchTables(): Promise<TableInfo[]> {
    const catalog = this.config.catalog || "main";

    try {
      const schemasQuery = `SHOW SCHEMAS IN ${catalog}`;
      const { rows: schemaRows } = await this.executeQuery(schemasQuery);

      const results: TableInfo[] = [];

      for (const schemaRow of schemaRows) {
        const schemaName = schemaRow[0];

        try {
          const tablesQuery = `SHOW TABLES IN ${catalog}.${schemaName}`;
          const { rows: tableRows } = await this.executeQuery(tablesQuery);

          for (const row of tableRows) {
            results.push({
              name: row[1],
              type: "TABLE",
              schema: schemaName,
            });
          }
        } catch (err) {
          console.error(`Could not access tables in schema ${schemaName}:`, err);
        }
      }

      return results;
    } catch (err) {
      console.error("Could not fetch tables:", err);
      return [];
    }
  }

  async fetchTableSummary({ schema, name }: Partial<TableInfo>): Promise<TableSummary> {
    const catalog = this.config.catalog || "main";
    const query = `DESCRIBE TABLE ${catalog}.${schema}.${name}`;

    const result = await this.executeQuery(query);
    const defs = {
      fields: ["col_name", "data_type", "comment"],
      rows: result.rows,
    };

    return { schema, name: name!, defs };
  }
}
