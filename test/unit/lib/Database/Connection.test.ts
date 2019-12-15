import assert from "assert";
import Connection from "../../../../src/lib/Database/Connection";

suite("Database/Connection", () => {
  suite("migrate", () => {
    test("execute migration", async () => {
      const connection = new Connection();
      await connection.initialize({ databasePath: ":memory:" });
      await connection.migrate([
        {
          version: 1000000000,
          query: "select 1"
        }
      ]);
    });

    test("should not execute already executed migration", async () => {
      const connection = new Connection();
      await connection.initialize({ databasePath: ":memory:" });
      try {
        await connection.migrate([
          {
            version: 0,
            query: "select 1"
          }
        ]);
        assert.fail();
      } catch (err) {
        // do nothing
      }
    });

    test("should not two migrations which have same version", async () => {
      const connection = new Connection();
      await connection.initialize({ databasePath: ":memory:" });
      try {
        await connection.migrate([
          {
            version: 1000000000,
            query: "select 1"
          },
          {
            version: 1000000000,
            query: "select 1"
          }
        ]);
        assert.fail();
      } catch (err) {
        // do nothing
      }
    });

    test("rollback when error occur", async () => {
      const connection = new Connection();
      await connection.initialize({ databasePath: ":memory:" });
      try {
        await connection.migrate([
          {
            version: 1000000000,
            query: "create table test_aaa(id integer);"
          },
          {
            version: 1000000001,
            query: "insert into test_aaa values(0);"
          },
          {
            version: 1000000002,
            query: "broken sql"
          }
        ]);
        assert.fail();
      } catch (err) {
        connection
          .get("select * from test_aaa;")
          .then(() => assert.fail())
          .catch(() => {
            // do nothing
          });
      }
    });
  });
});
