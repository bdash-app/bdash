import assert from "assert";
import moment from "moment";
import DatabaseHelper from "../../../helpers/DatabaseHelper";
import { QueryExecution } from "../../../../src/lib/Database/QueryExecution";
import { connection } from "../../../../src/lib/Database/Connection";

suite("Database/Query", () => {
  setup(() => DatabaseHelper.initialize());

  test("getAll", async () => {
    await connection.exec(`
      insert into query_executions
        (id, queryId, body, fields, rows, runAt)
      values
        (1, 10, 'select 1', '["1"]', '[[1]]', '2017-01-01 00:00:00'),
        (2, 10, 'select 2', '["2"]', '[[2]]', '2017-01-02 00:00:00')
    `);
    const rows = await QueryExecution.getAll(10);
    assert.deepStrictEqual(rows, [
      {
        id: 2,
        queryId: 10,
        body: "select 2",
        fields: ["2"],
        rows: [[2]],
        runAt: moment.utc("2017-01-02 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local()
      },
      {
        id: 1,
        queryId: 10,
        body: "select 1",
        fields: ["1"],
        rows: [[1]],
        runAt: moment.utc("2017-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local()
      }
    ]);
  });

  test("find", async () => {
    await connection.exec(`
      insert into query_executions
        (id, queryId, body, fields, rows, runAt)
      values
        (1, 10, 'select 1', '["1"]', '[[1]]', '2017-01-01 00:00:00')
    `);
    const row = await QueryExecution.find(1);
    assert.deepStrictEqual(row, {
      id: 1,
      queryId: 10,
      body: "select 1",
      fields: ["1"],
      rows: [[1]],
      runAt: moment.utc("2017-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local()
    });
  });

  test("create && delete", async () => {
    const queryId = 11;
    const body = "select 3;";
    const runAt = moment();
    const id = await QueryExecution.create(
      queryId,
      body,
      ["id", "name"],
      [
        [1, "a"],
        [2, "b"]
      ],
      runAt
    );
    assert.strictEqual(id > 0, true);
    await QueryExecution.delete(id);
  });
});
