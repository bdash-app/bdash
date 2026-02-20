import assert from "node:assert";
import { BdashDatabase } from "../src/database.js";
import { createTestDbPath, createTestDatabase, cleanupTestDb, seedDataSource, seedQuery } from "./test-helper.js";

suite("BdashDatabase", () => {
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

  suite("WAL mode", () => {
    test("WAL mode is enabled after initialization", async () => {
      // WAL mode is set during initialize(), verify by querying pragma
      const result = await new Promise<string>((resolve, reject) => {
        (db as any).db.get("PRAGMA journal_mode", (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row.journal_mode);
        });
      });
      assert.strictEqual(result, "wal");
    });
  });

  suite("getAllQueries", () => {
    test("returns empty array when no queries exist", async () => {
      const queries = await db.getAllQueries();
      assert.deepStrictEqual(queries, []);
    });

    test("returns all queries", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });
      await seedQuery(dbPath, { dataSourceId: dsId, title: "Query 1", body: "SELECT 1" });
      await seedQuery(dbPath, { dataSourceId: dsId, title: "Query 2", body: "SELECT 2" });

      const queries = await db.getAllQueries();
      assert.strictEqual(queries.length, 2);
      const titles = queries.map((q) => q.title).sort();
      assert.deepStrictEqual(titles, ["Query 1", "Query 2"]);
    });
  });

  suite("getQuery", () => {
    test("returns query by id", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });
      const queryId = await seedQuery(dbPath, { dataSourceId: dsId, title: "My Query", body: "SELECT * FROM users" });

      const query = await db.getQuery(queryId);
      assert.ok(query);
      assert.strictEqual(query.id, queryId);
      assert.strictEqual(query.title, "My Query");
      assert.strictEqual(query.body, "SELECT * FROM users");
      assert.strictEqual(query.dataSourceId, dsId);
    });

    test("returns null for non-existent id", async () => {
      const query = await db.getQuery(9999);
      assert.strictEqual(query, null);
    });
  });

  suite("createQuery", () => {
    test("creates a new query and returns it", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });

      const query = await db.createQuery(dsId, "New Query", "SELECT 1");
      assert.ok(query.id);
      assert.strictEqual(query.title, "New Query");
      assert.strictEqual(query.body, "SELECT 1");
      assert.strictEqual(query.dataSourceId, dsId);
      assert.ok(query.createdAt);
    });

    test("throws error for non-existent dataSourceId", async () => {
      await assert.rejects(
        () => db.createQuery(9999, "New Query", "SELECT 1"),
        (err: Error) => {
          assert.match(err.message, /DataSource not found: 9999/);
          return true;
        }
      );
    });
  });

  suite("writeQuery", () => {
    test("updates query body and resets codeMirrorHistory", async () => {
      const dsId = await seedDataSource(dbPath, { name: "test-ds", type: "mysql" });
      const queryId = await seedQuery(dbPath, { dataSourceId: dsId, title: "My Query", body: "SELECT 1" });

      const updated = await db.writeQuery(queryId, "SELECT * FROM users WHERE active = 1");
      assert.strictEqual(updated.id, queryId);
      assert.strictEqual(updated.body, "SELECT * FROM users WHERE active = 1");

      // Verify codeMirrorHistory was reset to null
      const refetched = await new Promise<any>((resolve, reject) => {
        (db as any).db.get(
          "SELECT codeMirrorHistory FROM queries WHERE id = ?",
          [queryId],
          (err: Error | null, row: any) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      assert.strictEqual(refetched.codeMirrorHistory, null);
    });

    test("throws error for non-existent query id", async () => {
      await assert.rejects(
        () => db.writeQuery(9999, "SELECT 1"),
        (err: Error) => {
          assert.match(err.message, /Query not found: 9999/);
          return true;
        }
      );
    });
  });
});
