import { connection } from "./Connection";
import Base from "../DataSourceDefinition/Base";
import { ChartType } from "./Chart";

export type QueryType = {
  readonly id: number;
  readonly dataSourceId: number;
  readonly title: string;
  readonly body: string;
  readonly fields?: any;
  readonly rows?: any;
  readonly status?: string;
  readonly chart?: ChartType;
  readonly runtime?: number;
  readonly errorMessage?: string;
  readonly selectedTab?: "table" | "chart";
  readonly executor?: Base | null;
  // ex. "2019-11-30 12:57:39"
  readonly runAt?: string;
};

export default class Query {
  static getAll(): Promise<QueryType[]> {
    return connection.all("select id, title from queries order by createdAt desc");
  }

  static async find(id: number): Promise<QueryType> {
    const query = await connection.get("select * from queries where id = ?", id);

    if (query.fields) {
      query.fields = JSON.parse(query.fields);
    }

    if (query.rows) {
      query.rows = JSON.parse(query.rows);
    }

    // For backword compatibility with beta version data structure.
    if (query.fields && typeof query.fields[0] === "object") {
      query.fields = query.fields.map(f => f.name);
    }
    if (query.rows && typeof query.rows[0] === "object" && !Array.isArray(query.rows[0])) {
      query.rows = query.rows.map(r => Object.values(r));
    }

    return query;
  }

  static async create(title: string, dataSourceId: number, body: string): Promise<QueryType> {
    const sql = `
      insert into queries
      (dataSourceId, title, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;
    const id = await connection.insert(sql, dataSourceId, title);

    return { id, dataSourceId, title, body };
  }

  static update(id: number, params: any): Promise<void> {
    const fields: string[] = [];
    const values: string[] = [];

    Object.keys(params).forEach(field => {
      fields.push(field);
      values.push(params[field]);
    });
    values.push(id.toString());

    const sql = `
      update queries
      set ${fields.map(f => `${f} = ?`).join(", ")}, updatedAt = datetime('now')
      where id = ?
    `;

    return connection.run(sql, values);
  }

  static del(id: number): Promise<void> {
    return connection.run("delete from queries where id = ?", id);
  }
}
