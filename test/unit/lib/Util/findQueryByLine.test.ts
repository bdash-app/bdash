import assert from "assert";
import stripHeredoc from "../../../../src/lib/Util/stripHeredoc";
import findQueryByLine from "../../../../src/lib/Util/findQueryByLine";

suite("Util/findQueryByLine", () => {
  test("valid behavior", async () => {
    const sql = stripHeredoc(`
      select a1, a2
      from b;
      -- comment

      select 1
      ;


      select 2
      from c
    `);

    const sql1 = "select a1, a2\nfrom b;";
    const sql2 = "-- comment\n\nselect 1\n;";
    const sql3 = "select 2\nfrom c";

    assert.deepStrictEqual(await findQueryByLine(sql, 1), {
      query: sql1,
      startLine: 1,
      endLine: 2
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 2), {
      query: sql1,
      startLine: 1,
      endLine: 2
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 3), {
      query: sql2,
      startLine: 3,
      endLine: 6
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 4), {
      query: sql2,
      startLine: 3,
      endLine: 6
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 5), {
      query: sql2,
      startLine: 3,
      endLine: 6
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 6), {
      query: sql2,
      startLine: 3,
      endLine: 6
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 7), {
      query: sql3,
      startLine: 9,
      endLine: 10
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 8), {
      query: sql3,
      startLine: 9,
      endLine: 10
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 9), {
      query: sql3,
      startLine: 9,
      endLine: 10
    });
  });

  test("first line is blank", async () => {
    const sql = "\nselect 1; \nselect 2;\n";
    const sql1 = "select 1;";
    const sql2 = "select 2;";

    assert.deepStrictEqual(await findQueryByLine(sql, 1), {
      query: sql1,
      startLine: 2,
      endLine: 2
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 2), {
      query: sql1,
      startLine: 2,
      endLine: 2
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 3), {
      query: sql2,
      startLine: 3,
      endLine: 3
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 4), {
      query: sql2,
      startLine: 3,
      endLine: 3
    });
  });

  test("only one line", async () => {
    const sql = "select 1;";
    assert.deepStrictEqual(await findQueryByLine(sql, 1), {
      query: "select 1;",
      startLine: 1,
      endLine: 1
    });
  });

  test("only one line and first line is blank", async () => {
    const sql = "\nselect 1;";
    assert.deepStrictEqual(await findQueryByLine(sql, 1), {
      query: "select 1;",
      startLine: 2,
      endLine: 2
    });
  });

  test("line comment has semicolon", async () => {
    const sql = stripHeredoc(`
      select 1; -- comment select 2; select 3
      select 4 ; select a
      from b
    `);
    assert.deepStrictEqual(await findQueryByLine(sql, 1), {
      query: "select 1;",
      startLine: 1,
      endLine: 1
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 2), {
      query: "-- comment select 2; select 3\nselect 4 ;",
      startLine: 1,
      endLine: 2
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 3), {
      query: "select a\nfrom b",
      startLine: 2,
      endLine: 3
    });
  });

  test("block comment has semicolon", async () => {
    const sql = stripHeredoc(`
      select 1; /* select 2; select 3;
      select 4; */ select a
      from b
    `);
    assert.deepStrictEqual(await findQueryByLine(sql, 1), {
      query: "select 1;",
      startLine: 1,
      endLine: 1
    });
    assert.deepStrictEqual(await findQueryByLine(sql, 2), {
      query: "/* select 2; select 3;\nselect 4; */ select a\nfrom b",
      startLine: 1,
      endLine: 3
    });
  });
});
