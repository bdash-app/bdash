import { Database } from "sqlite3";

export default async function initialize(path: string): Promise<any> {
  const db: Database = new Database(path);
  const execute = async (query: string): Promise<any> =>
    new Promise((resolve, reject) => {
      db.all(query, (err, results) => {
        if (err) {
          reject(err);
          return;
        } else {
          resolve(results);
        }
      });
    });

  await execute("drop table if exists test;");
  await execute("create table test (id int, text varchar(255));");
  await execute("insert into test (id, text) values (1, 'foo'), (2, 'bar'), (3, 'baz');");
}
