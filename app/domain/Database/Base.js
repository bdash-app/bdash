import sqlite3 from 'sqlite3';

export default class Base {
  static get db() {
    if (!Base._db) {
      throw new Error('Database is not initialized.');
    }

    return Base._db;
  }

  static initialize({ databasePath, schema }) {
    Base._db = new sqlite3.Database(databasePath);
    return Base.exec(schema);
  }

  static exec(sql) {
    return new Promise((resolve, reject) => {
      Base.db.exec(sql, err => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }

  static get(sql, ...params) {
    return new Promise((resolve, reject) => {
      Base.db.get(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }

  static all(sql, ...params) {
    return new Promise((resolve, reject) => {
      Base.db.all(sql, ...params, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
  }

  static insert(sql, ...params) {
    return new Promise((resolve, reject) => {
      Base.db.run(sql, ...params, function(err) {
        if (err) {
          reject(err);
        }
        else {
          resolve(this.lastID); // eslint-disable-line no-invalid-this
        }
      });
    });
  }

  static run(sql, ...params) {
    return new Promise((resolve, reject) => {
      Base.db.run(sql, ...params, err => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }
}
