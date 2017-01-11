import fs from 'fs';
import sqlite3 from 'sqlite3';
import Config from '../Config';
import Query from './Query';

export default class Database {
  static initialize() {
    Database.sqlite = new sqlite3.Database(Config.databasePath);
    return Database.exec(fs.readFileSync(Config.schemaPath).toString());
  }

  static exec(sql) {
    return new Promise((resolve, reject) => {
      Database.sqlite.exec(sql, err => {
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
      Database.sqlite.get(sql, ...params, (err, result) => {
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
      Database.sqlite.all(sql, ...params, (err, result) => {
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
      Database.sqlite.run(sql, ...params, function(err) {
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
      Database.sqlite.run(sql, ...params, err => {
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

Database.Query = Query;
