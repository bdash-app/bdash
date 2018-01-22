import { connection } from "./Connection";

export default class DataSource {
  static async getAll() {
    let sql =
      "select id, name, type, config from data_sources order by createdAt desc";
    let rows = await connection.all(sql);

    return rows.map(convert);
  }

  static async find(id) {
    let row = await connection.get(
      "select * from data_sources where id = ?",
      id
    );

    return convert(row);
  }

  static async count() {
    let row = await connection.get(
      "select count(*) as count from data_sources"
    );

    return row.count;
  }

  static async create(params) {
    let sql = `
      insert into data_sources
      (name, type, config, createdAt, updatedAt)
      values (?, ?, ?, datetime('now'), datetime('now'))
    `;
    let { name, type } = params;
    let config = JSON.stringify(params.config);
    let id = await connection.insert(sql, name, type, config);

    return this.find(id);
  }

  static async update(id, params) {
    let sql = `
      update data_sources
      set name = ?, type = ?, config = ?, updatedAt = datetime('now')
      where id = ?
    `;
    let { name, type } = params;
    let config = JSON.stringify(params.config);
    await connection.run(sql, name, type, config, id);

    return this.find(id);
  }

  static del(id) {
    return connection.run("delete from data_sources where id = ?", id);
  }
}

function convert(row) {
  let config = JSON.parse(row.config || "{}");
  return Object.assign(row, { config });
}
