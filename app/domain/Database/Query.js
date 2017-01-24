import { connection } from './Connection';

export default class Query {
  static getAll() {
    return connection.all('select id, title from queries order by createdAt desc');
  }

  static create({ title, dataSourceId }) {
    let sql = `
      insert into queries
      (dataSourceId, title, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;

    return connection.insert(sql, dataSourceId, title).then(id => {
      return { id, dataSourceId, title };
    });
  }

  static del(id) {
    return connection.run('delete from queries where id = ?', id);
  }
}
