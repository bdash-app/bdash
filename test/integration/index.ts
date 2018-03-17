import assert from "assert";
import path from "path";
import fse from "fs-extra";
import { Application } from "spectron";
import initializeMysql from "../fixtures/mysql/initialize";

let app;

// @ts-ignore
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setValueToEditor(text) {
  app.client.execute(text => {
    // @ts-ignore
    document.querySelector(".QueryEditor .CodeMirror").CodeMirror.setValue(text);
  }, text);
}

suite("Launch and onboarding", function() {
  this.timeout(10000);

  suiteSetup(async () => {
    const rootDir = path.join(__dirname, "..", "..");
    const bdashRootDir = path.join(rootDir, "tmp", "test", ".bdash");
    let appPath = path.join(rootDir, "node_modules", ".bin", "electron");
    if (process.platform === "win32") {
      appPath += ".cmd";
    }
    app = new Application({
      path: appPath,
      args: [path.join(rootDir, "tmp", "app")],
      env: { BDASH_ROOT: bdashRootDir }
    });
    await fse.remove(bdashRootDir);
    await initializeMysql();
    await app.start();
    app.client.timeoutsImplicitWait(500);
  });

  suiteTeardown(async () => {
    await app.stop();
  });

  test("Create a data source", async () => {
    await app.client.setValue('.DataSourceForm input[name="name"]', "Test Data Source");
    await app.client.selectByValue('.DataSourceForm select[name="type"]', "mysql");
    await app.client.setValue('.DataSourceForm input[name="host"]', "127.0.0.1");
    await app.client.setValue('.DataSourceForm input[name="user"]', "root");
    await app.client.setValue('.DataSourceForm input[name="database"]', "bdash_test");
    await app.client.click(".DataSourceForm-saveBtn");

    const title = await app.client.getText(".DataSourceList-list li:first-child");
    assert.strictEqual(title, "Test Data Source");
  });

  test("Create a query", async () => {
    await app.client.click(".GlobalMenu-query");
    const selectedQueryMenu = await app.client.isExisting(".GlobalMenu-query.is-selected");
    assert.ok(selectedQueryMenu);

    await app.client.click(".QueryList-new i");
    const queryTitle = await app.client.getText(".QueryList-list li:first-child");
    assert.strictEqual(queryTitle, "New Query");

    setValueToEditor("select * from test");
    await app.client.click(".QueryEditor-executeBtn");
    const existingTable = await app.client.isExisting(".QueryResultTable");
    assert.ok(existingTable);

    const rows = await app.client.elements(".QueryResultTable-table tbody tr");
    assert.strictEqual(rows.value.length, 3);
  });
});
