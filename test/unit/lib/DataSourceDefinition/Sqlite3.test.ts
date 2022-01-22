import assert from "assert";
import initialize from "../../../fixtures/sqlite3/initialize";
import SQLite3 from "../../../../src/lib/DataSourceDefinition/SQLite3";
import os from "os";
import fs from "fs";
import path from "path";
import { promisify } from "util";

suite("DataSourceDefinition/SQLite3 @remote", () => {
  const dbPath = path.join(os.tmpdir(), `bdash.${Math.floor(Math.random() * 100000)}.db`);
  const connection = new SQLite3({ path: dbPath });

  suiteSetup(async () => {
    await initialize(dbPath);
  });

  suiteTeardown(async () => {
    await promisify(fs.unlink)(dbPath);
  });

  test("select (empty)", async () => {
    const result = await connection.execute("select id, text from test where 1 = 2");
    assert.deepEqual(result, { fields: [], rows: [] });
  });

  test("select (non-empty)", async () => {
    const result = await connection.execute("select id, text from test order by id");
    assert.deepStrictEqual(result, {
      fields: ["id", "text"],
      rows: [
        [1, "foo"],
        [2, "bar"],
        [3, "baz"],
      ],
    });
  });

  test("insert", async () => {
    const result = await connection.execute("insert into test values (4, 'hoge')");
    assert.deepStrictEqual(result, {
      fields: [],
      rows: [],
    });
  });

  test("update", async () => {
    const result = await connection.execute("update test set text = 'hoge'");
    assert.deepStrictEqual(result, {
      fields: [],
      rows: [],
    });
  });

  test("delete", async () => {
    const result = await connection.execute("delete from test where id = 1");
    assert.deepStrictEqual(result, {
      fields: [],
      rows: [],
    });
  });
});
