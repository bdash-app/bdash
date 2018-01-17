import * as assert from 'assert';
import * as path from 'path';
import * as fse from 'fs-extra';
import { Application } from 'spectron';
import initializeMysql from '../fixtures/mysql/initialize';

const TEST_ROOT_DIR = path.join(__dirname, '../../tmp/test');
const TEST_APP_PATH = path.join(TEST_ROOT_DIR, 'Bdash-darwin-x64/Bdash.app/Contents/MacOS/Bdash');
const BDASH_ROOT = path.join(TEST_ROOT_DIR, '.bdash');
let app;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setValueToEditor(text) {
  app.client.execute(text => {
    document.querySelector('.QueryEditor .CodeMirror').CodeMirror.setValue(text);
  }, text);
}

suite('e2e test', function() {
  this.timeout(10000);

  suiteSetup(async () => {
    app = new Application({ path: TEST_APP_PATH });
    await fse.remove(BDASH_ROOT);
    await initializeMysql();
    await app.start();
    app.client.timeoutsImplicitWait(500);
  });

  suiteTeardown(async () => {
    await app.stop();
  });

  test('Create a data source', async () => {
    await app.client.setValue('.DataSourceForm input[name="name"]', 'Test Data Source');
    await app.client.selectByValue('.DataSourceForm select[name="type"]', 'mysql');
    await app.client.setValue('.DataSourceForm input[name="host"]', '127.0.0.1');
    await app.client.setValue('.DataSourceForm input[name="user"]', 'root');
    await app.client.setValue('.DataSourceForm input[name="database"]', 'bdash_test');
    await app.client.click('.DataSourceForm-saveBtn');

    const title = await app.client.getText('.DataSourceList-list li:first-child');
    assert.strictEqual(title, 'Test Data Source');
  });

  test('Create a query', async () => {
    await app.client.click('.GlobalMenu-query');
    const selectedQueryMenu = await app.client.isExisting('.GlobalMenu-query.is-selected');
    assert.ok(selectedQueryMenu);

    await app.client.click('.QueryList-new i');
    const queryTitle = await app.client.getText('.QueryList-list li:first-child');
    assert.strictEqual(queryTitle, 'New Query');

    setValueToEditor('select * from test');
    await app.client.click('.QueryEditor-executeBtn');
    const existingTable = await app.client.isExisting('.QueryResultTable');
    assert.ok(existingTable);

    const rows = await app.client.elements('.QueryResultTable-table tbody tr');
    assert.strictEqual(rows.value.length, 3);
  });
});
