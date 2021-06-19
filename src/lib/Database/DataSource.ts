import { connection } from "./Connection";
import { DataSourceType } from "../../renderer/pages/DataSource/DataSourceStore";

export default class DataSource {
  static async getAll(): Promise<DataSourceType[]> {
    const sql = "select id, name, type, config from data_sources order by createdAt desc";
    const rows = await connection.all(sql);

    return rows.map(convert);
  }

  static async find(id: number): Promise<DataSourceType> {
    const row = await connection.get("select * from data_sources where id = ?", id);
    return convert(row);
  }

  static async count(): Promise<number> {
    const row = await connection.get<{ count: number }>("select count(*) as count from data_sources");

    return row.count;
  }

  static async create(params: Pick<DataSourceType, "name" | "type" | "config">): Promise<DataSourceType> {
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

  static async update(id: number, params: Pick<DataSourceType, "name" | "type" | "config">): Promise<DataSourceType> {
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

  static del(id: number): Promise<void> {
    return connection.run("delete from data_sources where id = ?", id);
  }
}

function convert(row: any): DataSourceType {
  const config = JSON.parse(row.config || "{}");
  return { ...row, ...{ config }, mimeType: mimeType(row) };
}

const mimeType = (dsType: DataSourceType): string => {
  switch (dsType.type) {
    case "postgres":
    case "athena":
    case "redshift":
      return "text/x-pgsql";
    case "mysql":
      return "text/x-mysql";
    case "sqlite3":
      return "text/x-sqlite";
    case "treasuredata":
      if (dsType.config["queryType"] === "presco") {
        return "text/x-sql";
      } else {
        return "text/x-hive";
      }
    case "bigquery":
      return "text/x-sql";
    default:
      return "text/x-sql";
  }
};
