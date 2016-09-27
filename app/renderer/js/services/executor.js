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

  static fetchTableSummaryPostgres(table, connection) {
    // TODO: escape
    let sql = `
select
    pg_attribute.attname as name,
    pg_attribute.atttypid::regtype as type,
    pg_attribute.atttypmod as max_length,
    pg_attribute.attnotnull as not_null,
    pg_attribute.atthasdef as has_default,
    pg_description.description as description,
    pg_attrdef.adsrc as default_value
from
    pg_attribute
    left join pg_description on
        pg_description.objoid = pg_attribute.attrelid
        and pg_description.objsubid = pg_attribute.attnum
    left join pg_attrdef on
        pg_attrdef.adrelid = pg_attribute.attrelid
        and pg_attrdef.adnum = pg_attribute.attnum
where
    pg_attribute.attrelid = '${table}'::regclass
    and not pg_attribute.attisdropped
    and pg_attribute.attnum > 0
order by pg_attribute.attnum`;
    return this.executePostgres(sql, connection);
  }
}
