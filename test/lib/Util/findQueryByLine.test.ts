import * as assert from "assert";
import stripHeredoc from "../../../src/lib/Util/stripHeredoc";
import findQueryByLine from "../../../src/lib/Util/findQueryByLine";

suite("Util/findQueryByLine", () => {
  test("valid behavir", () => {
    const sql = stripHeredoc(`
      select a
      from b;
      -- comment

      select 1
      ;


      select 2
      from c
    `);

    const sql1 = "select a\nfrom b;";
    const sql2 = "-- comment\n\nselect 1\n;";
    const sql3 = "select 2\nfrom c";

    assert.deepStrictEqual(findQueryByLine(sql, 1), {
      query: sql1,
      startLine: 1
    });
    assert.deepStrictEqual(findQueryByLine(sql, 2), {
      query: sql1,
      startLine: 1
    });
    assert.deepStrictEqual(findQueryByLine(sql, 3), {
      query: sql2,
      startLine: 3
    });
    assert.deepStrictEqual(findQueryByLine(sql, 4), {
      query: sql2,
      startLine: 3
    });
    assert.deepStrictEqual(findQueryByLine(sql, 5), {
      query: sql2,
      startLine: 3
    });
    assert.deepStrictEqual(findQueryByLine(sql, 6), {
      query: sql2,
      startLine: 3
    });
    assert.deepStrictEqual(findQueryByLine(sql, 7), {
      query: sql3,
      startLine: 9
    });
    assert.deepStrictEqual(findQueryByLine(sql, 8), {
      query: sql3,
      startLine: 9
    });
    assert.deepStrictEqual(findQueryByLine(sql, 9), {
      query: sql3,
      startLine: 9
    });
  });

  test("first line is blank", () => {
    const sql = "\nselect 1; \nselect 2;\n";
    const sql1 = "select 1;";
    const sql2 = "select 2;";

    assert.deepStrictEqual(findQueryByLine(sql, 1), {
      query: sql1,
      startLine: 2
    });
    assert.deepStrictEqual(findQueryByLine(sql, 2), {
      query: sql1,
      startLine: 2
    });
    assert.deepStrictEqual(findQueryByLine(sql, 3), {
      query: sql2,
      startLine: 3
    });
    assert.deepStrictEqual(findQueryByLine(sql, 4), {
      query: sql2,
      startLine: 3
    });
  });

  test("only one line", () => {
    const sql = "select 1;";
    assert.deepStrictEqual(findQueryByLine(sql, 1), {
      query: "select 1;",
      startLine: 1
    });
  });

  test("only one line and first line is blank", () => {
    const sql = "\nselect 1;";
    assert.deepStrictEqual(findQueryByLine(sql, 1), {
      query: "select 1;",
      startLine: 2
    });
  });
});
