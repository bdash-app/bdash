import test from 'ava';
import { Application } from 'spectron';
import path from 'path';
import fse from 'fs-extra';
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

test.before(async () => {
  app = new Application({ path: TEST_APP_PATH });
  fse.removeSync(BDASH_ROOT);
  initializeMysql();
  await app.start();
  app.client.timeoutsImplicitWait(500);
});

test.after(async () => {
  await app.stop();
});

test('Create a data source', async t => {
  await app.client.setValue('.DataSourceForm input[name="name"]', 'Test Data Source');
  await app.client.selectByValue('.DataSourceForm select[name="type"]', 'mysql');
  await app.client.setValue('.DataSourceForm input[name="host"]', '127.0.0.1');
  await app.client.setValue('.DataSourceForm input[name="user"]', 'root');
  await app.client.setValue('.DataSourceForm input[name="database"]', 'bdash_test');
  await app.client.click('.DataSourceForm-saveBtn');

  let title = await app.client.getText('.DataSourceList-list li:first-child');
  t.is(title, 'Test Data Source');
});

test('Create a query', async t => {
  await app.client.click('.GlobalMenu-query');
  let selectedQueryMenu = await app.client.isExisting('.GlobalMenu-query.is-selected');
  t.true(selectedQueryMenu);

  await app.client.click('.QueryList-new i');
  let queryTitle = await app.client.getText('.QueryList-list li:first-child');
  t.is(queryTitle, 'New Query');

  setValueToEditor('select * from test');
  await app.client.click('.QueryEditor-executeBtn');
  let existingTable = await app.client.isExisting('.QueryResultTable');
  t.true(existingTable);

  let rows = await app.client.elements('.QueryResultTable-table tbody tr');
  t.is(rows.value.length, 3);
});
