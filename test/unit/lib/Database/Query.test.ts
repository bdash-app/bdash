import assert from "assert";
import moment from "moment";
import DatabaseHelper from "../../../helpers/DatabaseHelper";
import Query from "../../../../src/lib/Database/Query";
import { connection } from "../../../../src/lib/Database/Connection";

suite("Database/Query", () => {
  setup(() => DatabaseHelper.initialize());

  test("getAll", async () => {
    await connection.exec(`
      insert into queries
        (id, dataSourceId, title, updatedAt, createdAt, body)
      values
        (1, 0, 'title 1', '2017-01-02 00:00:00', '2017-01-01 00:00:00', 'select 1;'),
        (2, 0, 'title 2', '2017-01-02 00:00:00', '2017-01-01 00:00:00', 'select 1;')
    `);
    const rows = await Query.getAll();
    assert.deepStrictEqual(rows, [
      {
        id: 1,
        title: "title 1",
        createdAt: moment.utc("2017-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local(),
        body: "select 1;",
      },
      {
        id: 2,
        title: "title 2",
        createdAt: moment.utc("2017-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local(),
        body: "select 1;",
      },
    ]);
  });

  test("find", async () => {
    await connection.exec(`
      insert into queries
        (id, dataSourceId, title, body, runtime, status, fields, rows, runAt, updatedAt, createdAt)
      values
        (1, 2, 'title', 'select 1;', 100, 'success', '["id","name"]', '[[1, "a"], [2, "b"]]', '2017-01-03 00:00:00', '2017-01-02 00:00:00', '2017-01-01 00:00:00')
    `);
    const row = await Query.find(1);
    assert.deepStrictEqual(row, {
      id: 1,
      dataSourceId: 2,
      title: "title",
      body: "select 1;",
      runtime: 100,
      status: "success",
      fields: ["id", "name"],
      rows: [
        [1, "a"],
        [2, "b"],
      ],
      errorMessage: null,
      runAt: moment.utc("2017-01-03 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local(),
      updatedAt: moment.utc("2017-01-02 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local(),
      createdAt: moment.utc("2017-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss", true).local(),
      codeMirrorHistory: null,
      bdashServerQueryId: null,
    });
  });

  test("create", async () => {
    const title = "foo";
    const dataSourceId = 100;
    const query = await Query.create(title, dataSourceId, "");
    assert.strictEqual(typeof query.id, "number");
    assert.strictEqual(query.title, title);
    assert.strictEqual(query.dataSourceId, dataSourceId);
  });

  test("update", async () => {
    await connection.exec(`
      insert into queries
        (id, dataSourceId, title, body, runtime, status, fields, rows, runAt, updatedAt, createdAt)
      values
        (1, 2, 'title', 'select 1;', 100, 'success', '["id","name"]', '[[1, "a"], [2, "b"]]', '2017-01-03 00:00:00', '2017-01-02 00:00:00', '2017-01-01 00:00:00')
    `);
    await Query.update(1, { title: "updated" });
    const query = await Query.find(1);
    assert.strictEqual(query.title, "updated");
  });

  test("getCount returns 0 when no queries exist", async () => {
    const count = await Query.getCount();
    assert.strictEqual(count, 0);
  });

  test("getCount returns the number of queries", async () => {
    await connection.exec(`
      insert into queries
        (id, dataSourceId, title, updatedAt, createdAt, body)
      values
        (1, 0, 'title 1', '2017-01-02 00:00:00', '2017-01-01 00:00:00', 'select 1;'),
        (2, 0, 'title 2', '2017-01-02 00:00:00', '2017-01-01 00:00:00', 'select 2;')
    `);
    const count = await Query.getCount();
    assert.strictEqual(count, 2);
  });

  test("del", async () => {
    await connection.exec(`
      insert into queries
        (id, dataSourceId, title, body, runtime, status, fields, rows, runAt, updatedAt, createdAt)
      values
        (1, 2, 'title', 'select 1;', 100, 'success', '["id","name"]', '[[1, "a"], [2, "b"]]', '2017-01-03 00:00:00', '2017-01-02 00:00:00', '2017-01-01 00:00:00')
    `);
    await Query.del(1);
    const row = await connection.get("select count(*) as count from queries");
    assert.strictEqual(row.count, 0);
  });
});
