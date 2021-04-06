import assert from "assert";
import path from "path";
import os from "os";
import { Application } from "spectron";
import fse from "fs-extra";
import { Doc } from "codemirror";

let app: Application;
let bdashDir: string;

function appPath(): string {
  const distDir = path.join(__dirname, "../../dist/test");
  switch (process.platform) {
    case "linux":
      return `${distDir}/linux-unpacked/bdash`;
    case "darwin":
      return `${distDir}/mac/Bdash.app/Contents/MacOS/Bdash`;
    case "win32":
      return `${distDir}/win-unpacked/Bdash.exe`;
    default:
      throw new Error(`Invalid platform: ${process.platform}`);
  }
}

const setValueToEditor = (text: string) => {
  app.client.execute(text => {
    document.querySelector<Element & { CodeMirror: Doc }>(".QueryEditor .CodeMirror")?.CodeMirror?.setValue(text);
  }, text);
};

const getValueFromEditor = async (): Promise<string | undefined> =>
  await app.client.execute(() =>
    document.querySelector<Element & { CodeMirror: Doc }>(".QueryEditor .CodeMirror")?.CodeMirror.getValue()
  );

suite("Launch and onboarding", function() {
  this.timeout(100000);

  suiteSetup(async () => {
    app = new Application({ path: appPath() });
    bdashDir = path.join(os.tmpdir(), ".bdash");
    fse.removeSync(bdashDir);
    await app.start();
    app.client.setTimeout({ implicit: 500 });
  });

  suiteTeardown(async () => {
    await app.stop();
  });

  test("Create a data source", async () => {
    await (await app.client.$('.DataSourceForm input[name="name"]')).setValue("Test Data Source");
    await (await app.client.$('.DataSourceForm select[name="type"]')).selectByAttribute("value", "sqlite3");
    await (await app.client.$('.DataSourceForm input[name="path"]')).setValue(`${bdashDir}/bdash.sqlite3`);
    (await app.client.$(".DataSourceForm-saveBtn")).click();

    const title = await (await app.client.$(".DataSourceList-list li:first-child")).getText();
    assert.strictEqual(title, "Test Data Source (default)");
  });

  test("Create a query", async () => {
    await (await app.client.$(".GlobalMenu-query")).click();
    const selectedQueryMenu = await (await app.client.$(".GlobalMenu-query.is-selected")).isExisting();
    assert.ok(selectedQueryMenu);

    await (await app.client.$(".QueryList-new i")).click();
    const queryTitle = await (await app.client.$(".QueryList-list li:first-child")).getText();
    assert.strictEqual(queryTitle, "New Query");
  });

  test("Execute a query", async () => {
    setValueToEditor("select * from data_sources");
    await (await app.client.$(".QueryEditor-executeBtn")).click();
    const existingTable = await (await app.client.$(".QueryResultTable")).isExisting();
    assert.ok(existingTable);

    const rows = await app.client.$$(".QueryResultTable-table tbody tr");
    assert.strictEqual(rows.length, 1);
  });

  test("Switch between queries", async () => {
    await (await app.client.$(".QueryList-new i")).click();
    await app.client.waitUntil(async () => (await getValueFromEditor()) === "");
    setValueToEditor("select 1;");
    await (await app.client.$("ul.QueryList-list li:last-child")).click();
    await app.client.waitUntil(async () => (await getValueFromEditor()) === "select * from data_sources", {
      timeout: 5000,
      timeoutMsg: "Timeout 1",
      interval: 1000
    });
    const firstQuery = await getValueFromEditor();
    assert.strictEqual(firstQuery, "select * from data_sources");

    await (await app.client.$("ul.QueryList-list li:first-child")).click();
    await app.client.waitUntil(async () => (await getValueFromEditor()) !== "select * from data_sources", {
      timeout: 5000,
      timeoutMsg: "Timeout 2",
      interval: 1000
    });
    const secondQuery = await getValueFromEditor();
    assert.strictEqual(secondQuery, "select 1;");
  });
});
