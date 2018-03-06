import sqlite3 from "sqlite3";

export default class Connection {
  _db: any;

  get db() {
    if (!this._db) {
      throw new Error("Database is not initialized.");
    }

    return this._db;
  }

  initialize({ databasePath, schema }) {
    this._db = new sqlite3.Database(databasePath);
    return this.exec(schema);
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
