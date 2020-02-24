import moment from "moment";
import { connection } from "./Connection";
import Base from "../DataSourceDefinition/Base";
import { ChartType } from "./Chart";
import { deserializeDateTime } from ".";
import { QueryExecutionType } from "./QueryExecution";

type QueryHistory = {
  readonly id: number;
  readonly runAt: moment.Moment;
};

export type QueryResultType = {
  readonly queryId: number;
  readonly fields: any[];
  readonly rows: any[];
  readonly runAt: moment.Moment;
};

export type QueryType = {
  readonly id: number;
  readonly dataSourceId: number;
  readonly title: string;
  readonly body?: string;
  readonly histories: QueryHistory[];
  readonly fields?: any;
  readonly rows?: any;
  readonly status?: "success" | "failure" | "working";
  readonly chart?: ChartType;
  readonly runtime?: number | null;
  readonly errorMessage?: string | null;
  readonly selectedTab?: "table" | "chart";
  readonly executor?: Base | null;
  readonly runAt?: moment.Moment;
  readonly execution: QueryExecutionType | null;
};

export default class Query {
  static async getAll(): Promise<QueryType[]> {
    const rows = await connection.all(
      `select
         queries.id, queries.dataSourceId, queries.title, query_executions.id as executionId, query_executions.runAt
       from
         queries
       left join query_executions on queries.id = query_executions.queryId
       order by queries.createdAt desc, query_executions.runAt desc`
    );
    return rows.reduce((queries: QueryType[], row: any): QueryType[] => {
      const history: QueryHistory | undefined =
        row.executionId && row.runAt ? { id: row.executionId, runAt: deserializeDateTime(row.runAt) } : undefined;
      const query: QueryType = {
        id: row.id,
        dataSourceId: row.dataSourceId,
        title: row.title,
        histories: history ? [history] : [],
        execution: null
      };
      if (queries.length === 0) {
        return [query];
      } else if (queries[queries.length - 1].id === query.id) {
        if (history) {
          queries[queries.length - 1].histories.push(history);
        }
        return queries;
      } else {
        queries.push(query);
        return queries;
      }
    }, []);
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
      query.runAt = deserializeDateTime(query.runAt);
    }

    // For backword compatibility with beta version data structure.
    if (query.fields && typeof query.fields[0] === "object") {
      query.fields = query.fields.map(f => f.name);
    }
    if (query.rows && typeof query.rows[0] === "object" && !Array.isArray(query.rows[0])) {
      query.rows = query.rows.map(r => Object.values(r));
    }
    const histories: QueryHistory[] = (
      await connection.all(
        "select id, runAt from query_executions where queryId = ? order by query_executions.runAt desc",
        id
      )
    ).map(row => {
      row.runAt = deserializeDateTime(row.runAt);
      return row;
    });
    query.histories = histories;

    return query;
  }

  static async create(title: string, dataSourceId: number, body: string | undefined): Promise<QueryType> {
    const sql = `
      insert into queries
      (dataSourceId, title, updatedAt, createdAt)
      values (?, ?, datetime('now'), datetime('now'))
    `;
    const id = await connection.insert(sql, dataSourceId, title);

    return { id, dataSourceId, title, body, histories: [], execution: null };
  }

  static update(id: number, params: Partial<QueryType>): Promise<void> {
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

  static async del(id: number): Promise<void> {
    await connection.run("delete from query_executions where queryId = ?", id);
    await connection.run("delete from queries where id = ?", id);
  }
}
