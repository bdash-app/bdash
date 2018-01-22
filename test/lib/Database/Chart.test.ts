import * as assert from "assert";
import DatabaseHelper from "../../helpers/DatabaseHelper";
import Chart from "../../../src/lib/Database/Chart";
import { connection } from "../../../src/lib/Database/Connection";

suite("Database/Chart", () => {
  setup(() => DatabaseHelper.initialize());

  test("findAll", async () => {
    await connection.exec(`
      insert into charts
        (id, queryId, type, xColumn, yColumns, groupColumn, stacking, updatedAt, createdAt)
      values
        (1, 100, 'bar', 'x', '["a","b"]', "g", 1, '2017-02-01 00:00:00', '2017-01-01 00:00:00')
    `);
    const rows = await Chart.getAll();
    assert.deepStrictEqual(rows, [
      {
        id: 1,
        queryId: 100,
        type: "bar",
        xColumn: "x",
        yColumns: ["a", "b"],
        groupColumn: "g",
        stacking: 1,
        updatedAt: "2017-02-01 00:00:00",
        createdAt: "2017-01-01 00:00:00"
      }
    ]);
  });

  test("get", async () => {
    await connection.exec(`
      insert into charts
        (id, queryId, type, xColumn, yColumns, groupColumn, stacking, updatedAt, createdAt)
      values
        (1, 100, 'bar', 'x', '["a","b"]', "g", 1, '2017-02-01 00:00:00', '2017-01-01 00:00:00')
    `);
    const rows = await Chart.get(1);
    assert.deepStrictEqual(rows, {
      id: 1,
      queryId: 100,
      type: "bar",
      xColumn: "x",
      yColumns: ["a", "b"],
      groupColumn: "g",
      stacking: 1,
      updatedAt: "2017-02-01 00:00:00",
      createdAt: "2017-01-01 00:00:00"
    });
  });

  test("findOrCreateByQueryId", async () => {
    const queryId = 100;
    const type = "bar";
    const chart = await Chart.findOrCreateByQueryId({ queryId, type });
    assert.strictEqual(typeof chart.id, "number");
    assert.strictEqual(chart.queryId, queryId);
    assert.strictEqual(chart.type, type);

    const chart2 = await Chart.findOrCreateByQueryId({ queryId });
    assert.strictEqual(chart.id, chart2.id);
  });

  test("create", async () => {
    const queryId = 100;
    const type = "bar";
    const chart = await Chart.create({ queryId, type });
    assert.strictEqual(typeof chart.id, "number");
    assert.strictEqual(chart.queryId, queryId);
    assert.strictEqual(chart.type, type);
  });

  test("update", async () => {
    await connection.exec(`
      insert into charts
        (id, queryId, type, xColumn, yColumns, groupColumn, stacking, updatedAt, createdAt)
      values
        (1, 100, 'bar', 'x', '["a","b"]', "g", 1, '2017-02-01 00:00:00', '2017-01-01 00:00:00')
    `);
    const chart = await Chart.update(1, {
      xColumn: "new",
      yColumns: ["c", "d"]
    });
    assert.strictEqual(chart.xColumn, "new");
    assert.deepStrictEqual(chart.yColumns, ["c", "d"]);
  });
});
