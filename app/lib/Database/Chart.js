import { connection } from './Connection';

export default class Chart {
  static getAll() {
    return connection.all('select * from charts').then(charts => {
      return charts.map(convert);
    });
  }

  static get(id) {
    return connection.get('select * from charts where id = ?', id).then(convert);
  }

  static findOrCreateByQueryId({ queryId, type = 'line' }) {
    return connection.get('select * from charts where queryId = ?', queryId).then(chart => {
      return chart ? convert(chart) : Chart.create({ queryId, type });
    });
  }

  static create({ queryId, type = 'line' }) {
    let sql = `
      insert into charts
      (queryId, type, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;

    return connection.insert(sql, queryId, type).then(id => this.get(id));
  }

  static update(id, params) {
    let fields = [];
    let values = [];

    Object.keys(params).forEach(field => {
      fields.push(field);
      values.push(field === 'yColumns' ? JSON.stringify(params[field]) : params[field]);
    });
    values.push(id);

    let sql = `
      update charts
      set ${fields.map(f => `${f} = ?`).join(', ')}, updatedAt = datetime('now')
      where id = ?
    `;

    return connection.run(sql, values).then(() => this.get(id));
  }
}

function convert(row) {
  let yColumns = JSON.parse(row.yColumns || '[]');
  return Object.assign(row, { yColumns });
}
