import { connection } from './Connection';

export default class DataSource {
  static getAll() {
    let sql = 'select id, name, type, config from data_sources order by createdAt desc';
    return connection.all(sql).then(rows => {
      return rows.map(row => {
        let config = JSON.parse(row.config || '{}');
        return Object.assign(row, { config });
      });
    });
  }
}
