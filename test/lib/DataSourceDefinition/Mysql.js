import test from 'ava';
import initialize from '../../fixtures/mysql/initialize';
import Mysql from '../../../app/lib/DataSourceDefinition/Mysql';

test.before(async () => {
  await initialize();
});

// TODO: Make it possible to change the config via enviroment variables
let config = {
  host: '127.0.0.1',
  user: 'root',
  database: 'bdash_test',
};

test('execute', async t => {
  let result = await new Mysql(config).execute('select id, text from test order by id');
  t.deepEqual(result, {
    fields: ['id', 'text'],
    rows: [[1, 'foo'], [2, 'bar'], [3, 'baz']],
  });
});

test('cancel', async t => {
  let connection = new Mysql(config);
  let timer = setTimeout(() => t.fail('can not cancel'), 2000);
  setTimeout(() => connection.cancel(), 500);

  try {
    await connection.execute('select sleep(5)');
    clearTimeout(timer);
    t.pass();
  }
  catch (err) {
    t.fail(err);
  }
});

test('connectionTest successful', async t => {
  t.plan(1);
  await new Mysql(config).connectionTest();
  t.pass();
});

test('connectionTest failed', async t => {
  try {
    await new Mysql({ host: 'x' }).connectionTest();
    t.fail();
  }
  catch (err) {
    t.regex(err.message, /getaddrinfo ENOTFOUND/);
  }
});
