import { connection } from "./Connection";

export default class Chart {
  static async getAll() {
    let charts = await connection.all("select * from charts");

    return charts.map(convert);
  }

  static async get(id) {
    let row = await connection.get("select * from charts where id = ?", id);

    return convert(row);
  }

  static async findOrCreateByQueryId({ queryId, type = "line" }) {
    let chart = await connection.get(
      "select * from charts where queryId = ?",
      queryId
    );

    return chart ? convert(chart) : Chart.create({ queryId, type });
  }

  static async create({ queryId, type = "line" }) {
    let sql = `
      insert into charts
      (queryId, type, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;
    let id = await connection.insert(sql, queryId, type);

    return this.get(id);
  }

  static async update(id, params) {
    let fields = [];
    let values = [];

    Object.keys(params).forEach(field => {
      fields.push(field);
      values.push(
        field === "yColumns" ? JSON.stringify(params[field]) : params[field]
      );
    });
    values.push(id);

    let sql = `
      update charts
      set ${fields.map(f => `${f} = ?`).join(", ")}, updatedAt = datetime('now')
      where id = ?
    `;
    await connection.run(sql, values);

    return this.get(id);
  }
}

function convert(row) {
  let yColumns = JSON.parse(row.yColumns || "[]");
  return Object.assign(row, { yColumns });
}
