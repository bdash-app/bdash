import { connection } from './Connection';

export default class DataSource {
  static getAll() {
    let sql = 'select id, name, type, config from data_sources order by createdAt desc';
    return connection.all(sql).then(rows => rows.map(convert));
  }

  static find(id) {
    return connection.get('select * from data_sources where id = ?', id).then(convert);
  }

  static create(params) {
    let sql = `
      insert into data_sources
      (name, type, config, createdAt, updatedAt)
      values (?, ?, ?, datetime('now'), datetime('now'))
    `;
    let { name, type } = params;
    let config = JSON.stringify(params.config);

    return connection.insert(sql, name, type, config).then(id => this.find(id));
  }

  static update(id, params) {
    let sql = `
      update data_sources
      set name = ?, type = ?, config = ?, updatedAt = datetime('now')
      where id = ?
    `;
    let { name, type } = params;
    let config = JSON.stringify(params.config);

    return connection.run(sql, name, type, config, id).then(() => this.find(id));
  }

  static del(id) {
    return connection.run('delete from data_sources where id = ?', id);
  }
}

function convert(row) {
  let config = JSON.parse(row.config || '{}');
  return Object.assign(row, { config });
}
