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
  readonly createdAt: moment.Moment;
  readonly updatedAt: moment.Moment;
  readonly codeMirrorHistory?: Record<string, unknown> | null; // Edit history of CodeMirror.Doc. https://codemirror.net/doc/manual.html#getHistory
  readonly bdashServerQueryId?: string;
};

export type DatabaseQueryType = Omit<QueryType, "fields" | "rows" | "codeMirrorHistory"> & {
  fields: string | null;
  rows: string | null;
  codeMirrorHistory: string | null;
};

export default class Query {
  static async getAll(): Promise<Pick<QueryType, "id" | "title" | "body" | "createdAt">[]> {
    const results = await connection.all("select id, title, body, createdAt from queries order by createdAt desc");
    return results.map((query) => {
      if (query.createdAt) {
        query.createdAt = moment.utc(query.createdAt, "YYYY-MM-DD HH:mm:ss", true).local();
      }
      return query;
    });
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

    if (query.createdAt) {
      query.createdAt = moment.utc(query.createdAt, "YYYY-MM-DD HH:mm:ss", true).local();
    }

    if (query.updatedAt) {
      query.updatedAt = moment.utc(query.updatedAt, "YYYY-MM-DD HH:mm:ss", true).local();
    }

    // For backword compatibility with beta version data structure.
    if (query.fields && typeof query.fields[0] === "object") {
      query.fields = query.fields.map((f) => f.name);
    }
    if (query.rows && typeof query.rows[0] === "object" && !Array.isArray(query.rows[0])) {
      query.rows = query.rows.map((r) => Object.values(r));
    }

    if (query.codeMirrorHistory) {
      query.codeMirrorHistory = JSON.parse(query.codeMirrorHistory);
    }

    return query;
  }

  static async create(
    title: string,
    dataSourceId: number,
    body: string
  ): Promise<Pick<QueryType, "id" | "title" | "body" | "dataSourceId" | "createdAt">> {
    const now = moment();
    const nowAsString = now.format("YYYY-MM-DD HH:mm:ss");

    const sql = `
      insert into queries
      (dataSourceId, title, body, createdAt, updatedAt)
      values (?, ?, ?, "${nowAsString}", "${nowAsString}")
    `;
    const id = await connection.insert(sql, dataSourceId, title, body);

    return { id, dataSourceId, title, body, createdAt: now };
  }

  static update(id: number, params: Partial<DatabaseQueryType>): Promise<void> {
    const fields: string[] = [];
    const values: string[] = [];

    Object.keys(params).forEach((field) => {
      fields.push(field);
      values.push(params[field]);
    });
    values.push(id.toString());

    const sql = `
      update queries
      set ${fields.map((f) => `${f} = ?`).join(", ")}, updatedAt = datetime('now')
      where id = ?
    `;

    return connection.run(sql, values);
  }

  static del(id: number): Promise<void> {
    return connection.run("delete from queries where id = ?", id);
  }

  static async getCount(): Promise<number> {
    const row = await connection.get<{ count: number }>("select count(*) as count from queries");
    return row ? row.count : 0;
  }

  static async getUpdatedAt(id: number): Promise<string | null> {
    const row = await connection.get<{ updatedAt: string }>("select updatedAt from queries where id = ?", id);
    return row ? row.updatedAt : null;
  }
}
