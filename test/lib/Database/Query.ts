import test from 'ava';
import DatabaseHelper from '../../helpers/DatabaseHelper';
import Query from '../../../src/lib/Database/Query';
import { connection } from '../../../src/lib/Database/Connection';

test.beforeEach(t => DatabaseHelper.initialize());

test('getAll', async t => {
  await connection.exec(`
    insert into queries
      (id, dataSourceId, title, updatedAt, createdAt)
    values
      (1, 0, 'title 1', datetime('now'), '2017-01-01 00:00:00'),
      (2, 0, 'title 2', datetime('now'), '2017-01-02 00:00:00')
  `);
  let rows = await Query.getAll();
  t.deepEqual(rows, [
    { id: 2, title: 'title 2' },
    { id: 1, title: 'title 1' },
  ]);
});

test('find', async t => {
  await connection.exec(`
    insert into queries
      (id, dataSourceId, title, body, runtime, status, fields, rows, runAt, updatedAt, createdAt)
    values
      (1, 2, 'title', 'select 1;', 100, 'success', '["id","name"]', '[[1, "a"], [2, "b"]]', '2017-01-03 00:00:00', '2017-01-02 00:00:00', '2017-01-01 00:00:00')
  `);
  let row = await Query.find(1);
  t.deepEqual(row, {
    id: 1,
    dataSourceId: 2,
    title: 'title',
    body: 'select 1;',
    runtime: 100,
    status: 'success',
    fields: ['id', 'name'],
    rows: [[1, 'a'], [2, 'b']],
    errorMessage: null,
    runAt: '2017-01-03 00:00:00',
    updatedAt: '2017-01-02 00:00:00',
    createdAt: '2017-01-01 00:00:00',
  });
});

test('create', async t => {
  let title = 'foo';
  let dataSourceId = 100;
  let query = await Query.create({ title, dataSourceId });
  t.is(typeof query.id, 'number');
  t.is(query.title, title);
  t.is(query.dataSourceId, dataSourceId);
});

test('update', async t => {
  await connection.exec(`
    insert into queries
      (id, dataSourceId, title, body, runtime, status, fields, rows, runAt, updatedAt, createdAt)
    values
      (1, 2, 'title', 'select 1;', 100, 'success', '["id","name"]', '[[1, "a"], [2, "b"]]', '2017-01-03 00:00:00', '2017-01-02 00:00:00', '2017-01-01 00:00:00')
  `);
  await Query.update(1, { title: 'updated' });
  let query = await Query.find(1);
  t.is(query.title, 'updated');
});

test('del', async t => {
  await connection.exec(`
    insert into queries
      (id, dataSourceId, title, body, runtime, status, fields, rows, runAt, updatedAt, createdAt)
    values
      (1, 2, 'title', 'select 1;', 100, 'success', '["id","name"]', '[[1, "a"], [2, "b"]]', '2017-01-03 00:00:00', '2017-01-02 00:00:00', '2017-01-01 00:00:00')
  `);
  await Query.del(1);
  let row = await connection.get('select count(*) as count from queries');
  t.is(row.count, 0);
});
