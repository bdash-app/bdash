import assert from "assert";
import initialize from "../../../fixtures/postgres/initialize";
import Postgres from "../../../../src/lib/DataSourceDefinition/Postgres";
import DataSourceConfig from "../../../helpers/DataSourceConfig";

suite("DataSourceDefinition/Postgres @remote", () => {
  const config = DataSourceConfig.postgres;

  suiteSetup(async () => {
    await initialize();
  });

  test("select", async () => {
    const result = await new Postgres(config).execute("select id, text from test order by id");
    assert.deepStrictEqual(result, {
      fields: ["id", "text"],
      rows: [["1", "foo"], ["2", "bar"], ["3", "baz"]]
    });
  });

  test("update", async () => {
    const result = await new Postgres(config).execute("update test set text = 'hoge'");
    assert.deepStrictEqual(result, {
      fields: [],
      rows: []
    });
  });

  test("delete", async () => {
    const result = await new Postgres(config).execute("delete from test where id = 1");
    assert.deepStrictEqual(result, {
      fields: [],
      rows: []
    });
  });

  test("cancel", async () => {
    const connection = new Postgres(config);
    const timer = setTimeout(() => assert.fail("can not cancel"), 2000);
    setTimeout(() => connection.cancel(), 500);

    try {
      await connection.execute("select pg_sleep(5)");
    } catch (err) {
      clearTimeout(timer);
      assert.ok(/canceling statement due to user request/.test(err.message));
    }
  });

  test("connectionTest successful", async () => {
    await new Postgres(config).connectionTest();
  });

  test("connectionTest failed", async () => {
    try {
      await new Postgres({ host: "x" }).connectionTest();
      assert.fail("connectionTest does not fail");
    } catch (err) {
      assert.ok(/getaddrinfo ENOTFOUND/.test(err.message));
    }
  });
});
