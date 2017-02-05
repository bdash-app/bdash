import test from 'ava';
import initialize from '../../fixtures/postgres/initialize';
import Postgres from '../../../app/lib/DataSourceDefinition/Postgres';

test.before(() => {
  initialize();
});

// TODO: Make it possible to change the config via enviroment variables
let config = {
  host: '127.0.0.1',
  database: 'bdash_test',
};

test('execute', t => {
  return new Postgres(config).execute('select id, text from test order by id').then(result => {
    t.deepEqual(result, {
      fields: ['id', 'text'],
      rows: [['1', 'foo'], ['2', 'bar'], ['3', 'baz']],
    });
  });
});

test('cancel', t => {
  let connection = new Postgres(config);
  let timer = setTimeout(() => t.fail('can not cancel'), 2000);
  setTimeout(() => connection.cancel(), 500);

  return connection.execute('select pg_sleep(5)').then(() => {
    clearTimeout(timer);
    t.fail();
  }).catch(err => {
    t.regex(err.message, /canceling statement due to user request/);
  });
});

test('connectionTest successful', t => {
  t.plan(1);
  return new Postgres(config).connectionTest().then(() => {
    t.pass();
  });
});

test('connectionTest failed', t => {
  return new Postgres({ host: 'x' }).connectionTest().then(() => {
    t.fail();
  }).catch(err => {
    t.regex(err.message, /getaddrinfo ENOTFOUND/);
  });
});
