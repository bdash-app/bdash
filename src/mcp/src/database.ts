import sqlite3 from "sqlite3";
import path from "path";
import os from "os";

export interface DataSourceRow {
  id: number;
  name: string;
  type: string;
  config: string;
}

export interface DataSource {
  id: number;
  name: string;
  type: string;
  config: any;
}

export interface QueryRow {
  id: number;
  dataSourceId: number;
  title: string;
  body: string;
  status: string | null;
  runtime: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export class BdashDatabase {
  private db: sqlite3.Database | null = null;
  private databasePath: string;

  constructor(customPath?: string) {
    this.databasePath = customPath || path.join(os.homedir(), ".bdash", "bdash.sqlite3");
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.databasePath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to Bdash database: ${err.message}`));
        } else {
          // Enable WAL mode for concurrent access
          this.db!.run("PRAGMA journal_mode=WAL", (walErr) => {
            if (walErr) {
              reject(new Error(`Failed to enable WAL mode: ${walErr.message}`));
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.db = null;
          resolve();
        }
      });
    });
  }

  private ensureDb(): sqlite3.Database {
    if (!this.db) {
      throw new Error("Database is not initialized");
    }
    return this.db;
  }

  async getAllDataSources(): Promise<DataSource[]> {
    const db = this.ensureDb();
    return new Promise((resolve, reject) => {
      const sql = "SELECT id, name, type, config FROM data_sources ORDER BY createdAt DESC";
      db.all(sql, (err: Error | null, rows: DataSourceRow[]) => {
        if (err) {
          reject(err);
        } else {
          const dataSources = rows.map((row) => ({
            id: row.id,
            name: row.name,
            type: row.type,
            config: JSON.parse(row.config || "{}"),
          }));
          resolve(dataSources);
        }
      });
    });
  }

  async getDataSource(id: number): Promise<DataSource | null> {
    const db = this.ensureDb();
    return new Promise((resolve, reject) => {
      const sql = "SELECT id, name, type, config FROM data_sources WHERE id = ?";
      db.get(sql, [id], (err: Error | null, row: DataSourceRow | undefined) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            name: row.name,
            type: row.type,
            config: JSON.parse(row.config || "{}"),
          });
        }
      });
    });
  }

  async getAllQueries(): Promise<QueryRow[]> {
    const db = this.ensureDb();
    return new Promise((resolve, reject) => {
      const sql = "SELECT id, title, body, dataSourceId, createdAt FROM queries ORDER BY createdAt DESC";
      db.all(sql, (err: Error | null, rows: QueryRow[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getQuery(id: number): Promise<QueryRow | null> {
    const db = this.ensureDb();
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT id, dataSourceId, title, body, status, runtime, errorMessage, createdAt, updatedAt FROM queries WHERE id = ?";
      db.get(sql, [id], (err: Error | null, row: QueryRow | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async createQuery(dataSourceId: number, title: string, body: string): Promise<QueryRow> {
    const db = this.ensureDb();

    // Validate dataSourceId exists
    const ds = await this.getDataSource(dataSourceId);
    if (!ds) {
      throw new Error(`DataSource not found: ${dataSourceId}`);
    }

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO queries (dataSourceId, title, body, createdAt, updatedAt)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `;
      db.run(sql, [dataSourceId, title, body], function (err: Error | null) {
        if (err) {
          reject(err);
        } else {
          const id = this.lastID;
          // Fetch the created row to return consistent data
          db.get(
            "SELECT id, dataSourceId, title, body, status, runtime, errorMessage, createdAt, updatedAt FROM queries WHERE id = ?",
            [id],
            (fetchErr: Error | null, row: QueryRow | undefined) => {
              if (fetchErr) {
                reject(fetchErr);
              } else {
                resolve(row!);
              }
            }
          );
        }
      });
    });
  }

  async writeQuery(id: number, body: string): Promise<QueryRow> {
    const db = this.ensureDb();
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE queries
        SET body = ?, codeMirrorHistory = null, updatedAt = datetime('now')
        WHERE id = ?
      `;
      db.run(sql, [body, id], function (err: Error | null) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error(`Query not found: ${id}`));
        } else {
          db.get(
            "SELECT id, dataSourceId, title, body, status, runtime, errorMessage, createdAt, updatedAt FROM queries WHERE id = ?",
            [id],
            (fetchErr: Error | null, row: QueryRow | undefined) => {
              if (fetchErr) {
                reject(fetchErr);
              } else {
                resolve(row!);
              }
            }
          );
        }
      });
    });
  }
}
