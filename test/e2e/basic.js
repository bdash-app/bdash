import test from 'ava';
import { Application } from 'spectron';
import path from 'path';

test.beforeEach(async t => {
  t.context.app = new Application({
    path: path.join(__dirname, '../../out/Bdash-darwin-x64/Bdash.app/Contents/MacOS/Bdash'),
  });

  await t.context.app.start();
});

test.afterEach.always(async t => {
  await t.context.app.stop();
});

test(async t => {
  let app = t.context.app;

  t.true(await app.client.isExisting('.GlobalMenu-item:nth-child(1).is-selected'));
  await app.client.click('.GlobalMenu-item:nth-child(2)');
  t.true(await app.client.isExisting('.GlobalMenu-item:nth-child(2).is-selected'));

  // Create new data source
  await app.client.click('.DataSourceList-new i');
  await app.client.setValue('.DataSourceForm input[type="text"]:nth-child(1)', 'Test Data Source');
  await app.client.selectByValue('.DataSourceForm select:nth-child(1)', 'mysql');
  await app.client.click('.DataSourceForm-buttons .Button:nth-child(2)');
});
