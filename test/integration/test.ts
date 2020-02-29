import assert from "assert";
import path from "path";
import os from "os";
import { Application } from "spectron";
import fse from "fs-extra";

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
      throw new Error(`Invalid platfrom: ${process.platform}`);
  }
}

function setValueToEditor(text: string): void {
  app.client.execute(text => {
    // @ts-ignore
    document.querySelector(".QueryEditor .CodeMirror").CodeMirror.setValue(text);
  }, text);
}

const getValueFromEditor = async (): Promise<string> =>
  (
    await app.client.execute(() =>
      // @ts-ignore
      document.querySelector(".QueryEditor .CodeMirror").CodeMirror.getValue()
    )
  ).value;

suite("Launch and onboarding", function() {
  this.timeout(10000);

  suiteSetup(async () => {
    app = new Application({ path: appPath() });
    bdashDir = path.join(os.tmpdir(), ".bdash");
    fse.removeSync(bdashDir);
    await app.start();
    app.client.timeoutsImplicitWait(500);
  });

  suiteTeardown(async () => {
    await app.stop();
  });

  test("Create a data source", async () => {
    await app.client.setValue('.DataSourceForm input[name="name"]', "Test Data Source");
    await app.client.selectByValue('.DataSourceForm select[name="type"]', "sqlite3");
    await app.client.setValue('.DataSourceForm input[name="path"]', `${bdashDir}/bdash.sqlite3`);
    await app.client.click(".DataSourceForm-saveBtn");

    const title = await app.client.getText(".DataSourceList-list li:first-child");
    assert.strictEqual(title, "Test Data Source (default)");
  });

  test("Create a query", async () => {
    await app.client.click(".GlobalMenu-query");
    const selectedQueryMenu = await app.client.isExisting(".GlobalMenu-query.is-selected");
    assert.ok(selectedQueryMenu);

    await app.client.click(".QueryList-new i");
    const queryTitle = await app.client.getText(".QueryList-list li:first-child");
    assert.strictEqual(queryTitle, "New Query");
  });

  test("Execute a query", async () => {
    setValueToEditor("select * from data_sources");
    await app.client.click(".QueryEditor-executeBtn");
    const existingTable = await app.client.isExisting(".QueryResultTable");
    assert.ok(existingTable);

    const rows = await app.client.elements(".QueryResultTable-table tbody tr");
    assert.strictEqual(rows.value.length, 1);
  });

  test("Switch between queries", async () => {
    await app.client.click(".QueryList-new i");
    setValueToEditor("select 1;");
    await app.client.click("ul.QueryList-list li:last-child");
    await app.client.waitUntil(
      async () => (await getValueFromEditor()) === "select * from data_sources",
      5000,
      "Timeout 1",
      1000
    );
    const firstQuery = await getValueFromEditor();
    assert.strictEqual(firstQuery, "select * from data_sources");

    await app.client.click("ul.QueryList-list li:first-child");
    await app.client.waitUntil(
      async () => (await getValueFromEditor()) !== "select * from data_sources",
      5000,
      "Timeout 2",
      1000
    );
    const secondQuery = await getValueFromEditor();
    assert.strictEqual(secondQuery, "select 1;");
  });
});
