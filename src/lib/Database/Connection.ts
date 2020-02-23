import sqlite3 from "sqlite3";
import { migrations, Migration } from "./schema";

export default class Connection {
  _db: sqlite3.Database;

  get db(): sqlite3.Database {
    if (!this._db) {
      throw new Error("Database is not initialized.");
    }

    return this._db;
  }

  async initialize({ databasePath }: { databasePath: string }): Promise<void> {
    this._db = new sqlite3.Database(databasePath);
    await this.migrate(migrations);
  }

  async migrate(migrations: Migration[]): Promise<void> {
    await this.exec("begin;");
    try {
      const currentVersion: number = await this.get(`pragma user_version`).then(row => row.user_version);
      let lastVersion = 0;
      for (const m of migrations) {
        if (m.version <= lastVersion) {
          throw new Error(`Wrong migration script: version ${m.version}`);
        }
        if (m.version > currentVersion) {
          await this.exec(m.query);
          await this.exec(`pragma user_version = ${m.version}`);
        }
        lastVersion = m.version;
      }
      await this.exec("commit;");
    } catch (err) {
      await this.exec("rollback;");
      throw err;
    }
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(sql, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  get<T = any>(sql: string, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all<T = any>(sql: string, ...params: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...params, (err: Error | null, result: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  insert(sql: string, ...params: any[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, function(err: Error | null) {
        if (err) {
          reject(err);
        } else {
          // @ts-ignore
          resolve(this.lastID); // eslint-disable-line no-invalid-this
        }
      });
    });
  }

  run(sql: string, ...params: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const connection = new Connection();
