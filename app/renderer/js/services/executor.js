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
      let start = Date.now();
      connection.query(query, (err, rows, fields) => {
        let runtime = Date.now() - start;
        connection.end();
        if (err) {
          reject(err);
        }
        else {
          resolve({ fields, rows, runtime });
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
        let start = Date.now();
        client.query(query, (err, result) => {
          let runtime = Date.now() - start;
          pg.end();
          if (err) return reject(err);
          let { fields, rows } = result;
          resolve({ fields, rows, runtime });
        });
      });
    });
  }
}
