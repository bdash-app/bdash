import moment from "moment";
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
  readonly status?: "success" | "failure" | "working";
  readonly chart?: ChartType;
  readonly runtime?: number | null;
  readonly errorMessage?: string | null;
  readonly selectedTab?: "table" | "chart";
  readonly executor?: Base | null;
  readonly runAt?: moment.Moment;
  readonly codeMirrorHistory?: Record<string, unknown> | null; // Edit history of CodeMirror.Doc. https://codemirror.net/doc/manual.html#getHistory
};

export type DatabaseQueryType = Omit<QueryType, "fields" | "rows" | "codeMirrorHistory"> & {
  fields: string | null;
  rows: string | null;
  codeMirrorHistory: string | null;
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

    if (query.runAt) {
      query.runAt = moment.utc(query.runAt, "YYYY-MM-DD HH:mm:ss", true).local();
    }

    // For backword compatibility with beta version data structure.
    if (query.fields && typeof query.fields[0] === "object") {
      query.fields = query.fields.map(f => f.name);
    }
    if (query.rows && typeof query.rows[0] === "object" && !Array.isArray(query.rows[0])) {
      query.rows = query.rows.map(r => Object.values(r));
    }

    if (query.codeMirrorHistory) {
      query.codeMirrorHistory = JSON.parse(query.codeMirrorHistory);
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

  static update(id: number, params: Partial<DatabaseQueryType>): Promise<void> {
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
