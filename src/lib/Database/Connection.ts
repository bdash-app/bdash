import sqlite3 from "sqlite3";
import { migrations, Migration } from "./schema";

export default class Connection {
  _db: any;

  get db() {
    if (!this._db) {
      throw new Error("Database is not initialized.");
    }

    return this._db;
  }

  async initialize({ databasePath }): Promise<void> {
    this._db = new sqlite3.Database(databasePath);
    await this.migrate(migrations);
  }

  async migrate(migrations: Migration[]): Promise<void> {
    await this.exec('begin;');
    try {
      await this.exec(
        `create table if not exists schema_version (
            version integer primary key
        );`
      );
      const current_version: number = await this.get(`select version from schema_version`).then(
        async (row: { version: number } | undefined) => {
          if (row) {
            return row.version;
          } else {
            await this.exec(`insert into schema_version(version) values (0);`);
            return 0;
          }
        }
      );

      let last_version: number = 0;
      for (const m of migrations) {
        if (m.version <= last_version) {
          throw new Error(`Wrong migration script: version ${m.version}`);
        }
        if (m.version > current_version) {
          await this.exec(m.query);
          await this.run(`update schema_version set version = ?`, m.version);
        }
        last_version = m.version;
      }
      await this.exec('commit;');
    } catch (err) {
      await this.exec('rollback;');
      throw err;
    }
  }

  exec(sql): Promise<any> {
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

  get(sql, ...params): Promise<any> {
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

  all(sql, ...params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  insert(sql, ...params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, function(err) {
        if (err) {
          reject(err);
        } else {
          // @ts-ignore
          resolve(this.lastID); // eslint-disable-line no-invalid-this
        }
      });
    });
  }

  run(sql, ...params): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, ...params, err => {
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
