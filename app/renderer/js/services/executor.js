import mysql from 'mysql';
import pg from 'pg';

export default class Executor {
  static execute(type, query, connectionInfo) {
    switch(type) {
      case 'mysql': return this.executeMySql(query, connectionInfo);
      case 'postgres': return this.executePostgres(query, connectionInfo);
    }
  }

  static executeMySql(query, connectionInfo) {
    let connection = mysql.createConnection({
      host: connectionInfo.host,
      user: connectionInfo.user,
      password: connectionInfo.password,
      database: connectionInfo.database,
    });

    return new Promise((resolve, reject) => {
      connection.query(query, (err, rows, fields) => {
        connection.end();
        if (err) {
          reject(err);
        }
        else {
          resolve([fields, rows]);
        }
      });
    });
  }

  static executePostgres(query, connectionInfo) {
    let options = {
      host: connectionInfo.host,
      user: connectionInfo.user,
      password: connectionInfo.password,
      database: connectionInfo.database,
    };

    return new Promise((resolve, reject) => {
      pg.connect(options, (err, client) => {
        if (err) return reject(err);
        client.query(query, (err, result) => {
          pg.end();
          if (err) return reject(err);
          resolve([result.fields, result.rows]);
        });
      });
    });
  }
}
