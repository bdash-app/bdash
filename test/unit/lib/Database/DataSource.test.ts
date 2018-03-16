import assert from "assert";
import DatabaseHelper from "../../../helpers/DatabaseHelper";
import DataSource from "../../../../src/lib/Database/DataSource";
import { connection } from "../../../../src/lib/Database/Connection";

suite("Database/DataSource", () => {
  setup(() => DatabaseHelper.initialize());

  test("findAll", async () => {
    await connection.exec(`
      insert into data_sources
        (id, name, type, config, updatedAt, createdAt)
      values
        (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00'),
        (2, 'name 2', 'mysql', '{"foo":"bar"}', '2017-02-02 00:00:00', '2017-01-02 00:00:00')
    `);
    const rows = await DataSource.getAll();
    assert.deepStrictEqual(rows, [
      { id: 2, name: "name 2", type: "mysql", config: { foo: "bar" } },
      { id: 1, name: "name 1", type: "mysql", config: { foo: "bar" } }
    ]);
  });

  test("find", async () => {
    await connection.exec(`
      insert into data_sources
        (id, name, type, config, updatedAt, createdAt)
      values
        (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00')
    `);
    const dataSource = await DataSource.find(1);
    assert.deepStrictEqual(dataSource, {
      id: 1,
      name: "name 1",
      type: "mysql",
      config: { foo: "bar" },
      updatedAt: "2017-02-01 00:00:00",
      createdAt: "2017-01-01 00:00:00"
    });
  });

  test("count", async () => {
    await connection.exec(`
      insert into data_sources
        (id, name, type, config, updatedAt, createdAt)
      values
        (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00'),
        (2, 'name 2', 'mysql', '{"foo":"bar"}', '2017-02-02 00:00:00', '2017-01-02 00:00:00')
    `);
    const count = await DataSource.count();
    assert.strictEqual(count, 2);
  });

  test("create", async () => {
    const name = "name";
    const type = "mysql";
    const config = { foo: "bar" };
    const dataSource = await DataSource.create({ name, type, config });
    assert.strictEqual(typeof dataSource.id, "number");
    assert.strictEqual(dataSource.name, name);
    assert.strictEqual(dataSource.type, type);
    assert.deepStrictEqual(dataSource.config, { foo: "bar" });
  });

  test("update", async () => {
    await connection.exec(`
      insert into data_sources
        (id, name, type, config, updatedAt, createdAt)
      values
        (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00')
    `);
    await DataSource.update(1, {
      name: "updated",
      type: "postgres",
      config: { a: "b" }
    });
    const dataSource = await DataSource.find(1);
    assert.strictEqual(dataSource.name, "updated");
    assert.strictEqual(dataSource.type, "postgres");
    assert.deepStrictEqual(dataSource.config, { a: "b" });
  });

  test("del", async () => {
    await connection.exec(`
      insert into data_sources
        (id, name, type, config, updatedAt, createdAt)
      values
        (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00')
    `);
    await DataSource.del(1);
    const count = await DataSource.count();
    assert.strictEqual(count, 0);
  });
});
