import moment from "moment";
import { connection } from "./Connection";
import { deserializeDateTime } from ".";

export type QueryExecutionType = {
  readonly id: number;
  readonly queryId: number;
  readonly body: string;
  readonly fields: any[];
  readonly rows: any[];
  readonly runAt: moment.Moment;
};

export class QueryExecution {
  static async find(queryExecutionId: number): Promise<QueryExecutionType> {
    const execution = await connection.get(
      "select id, queryId, body, fields, rows, runAt from query_executions where id = ?",
      queryExecutionId
    );
    execution.fields = JSON.parse(execution.fields);
    execution.rows = JSON.parse(execution.rows);
    execution.runAt = deserializeDateTime(execution.runAt);
    return execution;
  }

  static async getAll(queryId: number): Promise<QueryExecutionType[]> {
    const executions = await connection.all(
      "select id, queryId, body, fields, rows, runAt from query_executions where queryId = ? order by query_executions.runAt desc",
      queryId
    );
    executions.forEach(execution => {
      execution.fields = JSON.parse(execution.fields);
      execution.rows = JSON.parse(execution.rows);
      execution.runAt = deserializeDateTime(execution.runAt);
    });
    return executions;
  }

  static async delete(id: number): Promise<void> {
    return await connection.run("delete from query_executions where id = ?", id);
  }

  // return id
  static async create(
    queryId: number,
    body: string,
    fields: any[],
    rows: any[],
    runAt: moment.Moment
  ): Promise<number> {
    return await connection.insert(
      `insert into query_executions
    (queryId, body, fields, rows, runAt)
    values (?, ?, ?, ?, ?)`,
      queryId,
      body,
      JSON.stringify(fields),
      JSON.stringify(rows),
      runAt.utc().format("YYYY-MM-DD HH:mm:ss")
    );
  }
}
