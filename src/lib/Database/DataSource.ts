import { connection } from "./Connection";

export default class DataSource {
  static async getAll() {
    const sql = "select id, name, type, config from data_sources order by createdAt desc";
    const rows = await connection.all(sql);

    return rows.map(convert);
  }

  static async find(id) {
    const row = await connection.get("select * from data_sources where id = ?", id);

    return convert(row);
  }

  static async count() {
    const row = await connection.get("select count(*) as count from data_sources");

    return row.count;
  }

  static async create(params) {
    const sql = `
      insert into data_sources
      (name, type, config, createdAt, updatedAt)
      values (?, ?, ?, datetime('now'), datetime('now'))
    `;
    const { name, type } = params;
    const config = JSON.stringify(params.config);
    const id = await connection.insert(sql, name, type, config);

    return this.find(id);
  }

  static async update(id, params) {
    const sql = `
      update data_sources
      set name = ?, type = ?, config = ?, updatedAt = datetime('now')
      where id = ?
    `;
    const { name, type } = params;
    const config = JSON.stringify(params.config);
    await connection.run(sql, name, type, config, id);

    return this.find(id);
  }

  static del(id) {
    return connection.run("delete from data_sources where id = ?", id);
  }
}

function convert(row) {
  const config = JSON.parse(row.config || "{}");
  return Object.assign(row, { config });
}
