import test from 'ava';
import initialize from '../../fixtures/postgres/initialize';
import Postgres from '../../../app/lib/DataSourceDefinition/Postgres';

test.before(async () => {
  await initialize();
});

// TODO: Make it possible to change the config via enviroment variables
let config = {
  host: '127.0.0.1',
  database: 'bdash_test',
};

test('execute', async t => {
  let result = await new Postgres(config).execute('select id, text from test order by id');
  t.deepEqual(result, {
    fields: ['id', 'text'],
    rows: [['1', 'foo'], ['2', 'bar'], ['3', 'baz']],
  });
});

test('cancel', async t => {
  let connection = new Postgres(config);
  let timer = setTimeout(() => t.fail('can not cancel'), 2000);
  setTimeout(() => connection.cancel(), 500);

  try {
    await connection.execute('select pg_sleep(5)');
    clearTimeout(timer);
    t.fail();
  }
  catch (err) {
    t.regex(err.message, /canceling statement due to user request/);
  }
});

test('connectionTest successful', async t => {
  t.plan(1);
  await new Postgres(config).connectionTest();
  t.pass();
});

test('connectionTest failed', async t => {
  try {
    await new Postgres({ host: 'x' }).connectionTest();
    t.fail();
  }
  catch (err) {
    t.regex(err.message, /getaddrinfo ENOTFOUND/);
  }
});
