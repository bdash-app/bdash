import { connection } from "./Connection";

export type ChartType = {
  readonly id: number;
  readonly queryId: number;
  readonly type: "line" | "bar" | "area" | "pie";
  readonly xColumn: string;
  readonly yColumns: Array<string>;
  readonly groupColumn: string;
  readonly stacking: 0 | string;
  readonly updatedAt: string;
  readonly createdAt: string;
};

export default class Chart {
  static async getAll(): Promise<ChartType[]> {
    const charts = await connection.all("select * from charts");

    return charts.map(convert);
  }

  static async get(id: number): Promise<ChartType> {
    const row = await connection.get("select * from charts where id = ?", id);

    return convert(row);
  }

  static async findOrCreateByQueryId({
    queryId,
    type = "line"
  }: {
    queryId: number;
    type?: string;
  }): Promise<ChartType> {
    const chart = await connection.get("select * from charts where queryId = ?", queryId);

    return chart ? convert(chart) : Chart.create({ queryId, type });
  }

  static async create({ queryId, type = "line" }: { queryId: number; type: string }): Promise<ChartType> {
    const sql = `
      insert into charts
      (queryId, type, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;
    const id = await connection.insert(sql, queryId, type);

    return this.get(id);
  }

  static async update(id: number, params: { [key: string]: any }): Promise<ChartType> {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    Object.keys(params).forEach(field => {
      fields.push(field);
      values.push(field === "yColumns" ? JSON.stringify(params[field]) : params[field]);
    });
    values.push(id);

    const sql = `
      update charts
      set ${fields.map(f => `${f} = ?`).join(", ")}, updatedAt = datetime('now')
      where id = ?
    `;
    await connection.run(sql, values);

    return this.get(id);
  }
}

function convert(row): ChartType {
  const yColumns = JSON.parse(row.yColumns || "[]");
  return Object.assign(row, { yColumns });
}
