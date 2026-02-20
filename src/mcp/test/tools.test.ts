import assert from "node:assert";
import { BdashDatabase } from "../src/database.js";
import { listDatasources } from "../src/tools/list-datasources.js";
import { listQueries } from "../src/tools/list-queries.js";
import { getQuery } from "../src/tools/get-query.js";
import { writeQuery } from "../src/tools/write-query.js";
import { createQuery } from "../src/tools/create-query.js";
import { createTestDbPath, createTestDatabase, cleanupTestDb, seedDataSource, seedQuery } from "./test-helper.js";

suite("Tools API", () => {
  let dbPath: string;
  let db: BdashDatabase;

  setup(async () => {
    dbPath = createTestDbPath();
    db = await createTestDatabase(dbPath);
  });

  teardown(async () => {
    await db.close();
    cleanupTestDb(dbPath);
  });

  suite("list_datasources", () => {
    test("returns empty list when no data sources exist", async () => {
      const result = await listDatasources(db);
      assert.strictEqual(result.isError, undefined);
      const parsed = JSON.parse(result.content[0].text);
      assert.deepStrictEqual(parsed.dataSources, []);
    });

    test("returns data sources with id, name, type", async () => {
      await seedDataSource(dbPath, { name: "production-mysql", type: "mysql" });

      const result = await listDatasources(db);
      const parsed = JSON.parse(result.content[0].text);
      assert.strictEqual(parsed.dataSources.length, 1);
      assert.strictEqual(parsed.dataSources[0].name, "production-mysql");
      assert.strictEqual(parsed.dataSources[0].type, "mysql");
      assert.ok(parsed.dataSources[0].id);
    });
  });

  suite("list_queries", () => {
    test("returns empty list when no queries exist", async () => {
      const result = await listQueries(db);
      assert.strictEqual(result.isError, undefined);
      const parsed = JSON.parse(result.content[0].text);
      assert.deepStrictEqual(parsed.queries, []);
    });

    test("returns queries with id, title, body, dataSourceId, createdAt", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });
      await seedQuery(dbPath, { dataSourceId: dsId, title: "My Query", body: "SELECT 1" });

      const result = await listQueries(db);
      const parsed = JSON.parse(result.content[0].text);
      assert.strictEqual(parsed.queries.length, 1);
      assert.strictEqual(parsed.queries[0].title, "My Query");
      assert.strictEqual(parsed.queries[0].body, "SELECT 1");
      assert.strictEqual(parsed.queries[0].dataSourceId, dsId);
      assert.ok(parsed.queries[0].createdAt);
    });
  });

  suite("get_query", () => {
    test("returns query details for valid id", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });
      const queryId = await seedQuery(dbPath, { dataSourceId: dsId, title: "My Query", body: "SELECT * FROM users" });

      const result = await getQuery(db, { id: queryId });
      assert.strictEqual(result.isError, undefined);
      const parsed = JSON.parse(result.content[0].text);
      assert.strictEqual(parsed.id, queryId);
      assert.strictEqual(parsed.title, "My Query");
      assert.strictEqual(parsed.body, "SELECT * FROM users");
    });

    test("returns error when id is missing", async () => {
      const result = await getQuery(db, {});
      assert.strictEqual(result.isError, true);
      assert.strictEqual(result.content[0].text, "id is required");
    });

    test("returns error for non-existent id", async () => {
      const result = await getQuery(db, { id: 9999 });
      assert.strictEqual(result.isError, true);
      assert.strictEqual(result.content[0].text, "Query not found: 9999");
    });
  });

  suite("write_query", () => {
    test("updates query body and returns updated query", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });
      const queryId = await seedQuery(dbPath, { dataSourceId: dsId, title: "My Query", body: "SELECT 1" });

      const result = await writeQuery(db, { id: queryId, body: "SELECT * FROM users WHERE active = 1" });
      assert.strictEqual(result.isError, undefined);
      const parsed = JSON.parse(result.content[0].text);
      assert.strictEqual(parsed.id, queryId);
      assert.strictEqual(parsed.body, "SELECT * FROM users WHERE active = 1");
      assert.ok(parsed.updatedAt);
    });

    test("returns error when id is missing", async () => {
      const result = await writeQuery(db, { body: "SELECT 1" });
      assert.strictEqual(result.isError, true);
      assert.strictEqual(result.content[0].text, "id is required");
    });

    test("returns error when body is missing", async () => {
      const result = await writeQuery(db, { id: 1 });
      assert.strictEqual(result.isError, true);
      assert.strictEqual(result.content[0].text, "body is required");
    });

    test("returns error for non-existent query id", async () => {
      const result = await writeQuery(db, { id: 9999, body: "SELECT 1" });
      assert.strictEqual(result.isError, true);
      assert.match(result.content[0].text, /Query not found: 9999/);
    });
  });

  suite("create_query", () => {
    test("creates a new query with default title and empty body", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });

      const result = await createQuery(db, { dataSourceId: dsId });
      assert.strictEqual(result.isError, undefined);
      const parsed = JSON.parse(result.content[0].text);
      assert.ok(parsed.id);
      assert.strictEqual(parsed.title, "New Query");
      assert.strictEqual(parsed.body, "");
      assert.strictEqual(parsed.dataSourceId, dsId);
    });

    test("creates a new query with custom title and body", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });

      const result = await createQuery(db, { dataSourceId: dsId, title: "Custom Query", body: "SELECT 1" });
      assert.strictEqual(result.isError, undefined);
      const parsed = JSON.parse(result.content[0].text);
      assert.strictEqual(parsed.title, "Custom Query");
      assert.strictEqual(parsed.body, "SELECT 1");
    });

    test("returns error when dataSourceId is missing", async () => {
      const result = await createQuery(db, {});
      assert.strictEqual(result.isError, true);
      assert.strictEqual(result.content[0].text, "dataSourceId is required");
    });

    test("returns error for non-existent dataSourceId", async () => {
      const result = await createQuery(db, { dataSourceId: 9999 });
      assert.strictEqual(result.isError, true);
      assert.match(result.content[0].text, /DataSource not found: 9999/);
    });
  });
});
