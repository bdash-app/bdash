import test from 'ava';
import initialize from '../../fixtures/mysql/initialize';
import Mysql from '../../../app/lib/DataSourceDefinition/Mysql';

test.before(() => {
  initialize();
});

// TODO: Make it possible to change the config via enviroment variables
let mysql = new Mysql({ host: '127.0.0.1', user: 'root', database: 'bdash_test' });

test('execute', t => {
  return mysql.execute('select id, text from test order by id').then(result => {
    t.deepEqual(result, {
      fields: ['id', 'text'],
      rows: [[1, 'foo'], [2, 'bar'], [3, 'baz']],
    });
  });
});
