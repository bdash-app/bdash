import assert from "assert";
import stripHeredoc from "../../../src/lib/Util/stripHeredoc";

suite("Util/stripHeredoc", () => {
  test("valid behavir", () => {
    const str = `
      foo
        bar
      baz
    `;
    const expected = "foo\n  bar\nbaz";
    assert.strictEqual(stripHeredoc(str), expected);
  });
});
