import test from 'ava';
import initialize from '../../fixtures/postgres/initialize';
import Postgres from '../../../app/lib/DataSourceDefinition/Postgres';

test.before(() => {
  initialize();
});

// TODO: Make it possible to change the config via enviroment variables
let postgres = new Postgres({ host: '127.0.0.1', database: 'bdash_test' });

test('execute', t => {
  return postgres.execute('select id, text from test order by id').then(result => {
    t.deepEqual(result, {
      fields: ['id', 'text'],
      rows: [['1', 'foo'], ['2', 'bar'], ['3', 'baz']],
    });
  });
});
