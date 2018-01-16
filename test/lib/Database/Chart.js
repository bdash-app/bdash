import test from 'ava';
import DatabaseHelper from '../../helpers/DatabaseHelper';
import Chart from '../../../src/lib/Database/Chart';
import { connection } from '../../../src/lib/Database/Connection';

test.beforeEach(t => DatabaseHelper.initialize());

test('findAll', async t => {
  await connection.exec(`
    insert into charts
      (id, queryId, type, xColumn, yColumns, groupColumn, stacking, updatedAt, createdAt)
    values
      (1, 100, 'bar', 'x', '["a","b"]', "g", 1, '2017-02-01 00:00:00', '2017-01-01 00:00:00')
  `);
  let rows = await Chart.getAll();
  t.deepEqual(rows, [
    {
      id: 1,
      queryId: 100,
      type: 'bar',
      xColumn: 'x',
      yColumns: ['a', 'b'],
      groupColumn: 'g',
      stacking: 1,
      updatedAt: '2017-02-01 00:00:00',
      createdAt: '2017-01-01 00:00:00',
    },
  ]);
});

test('get', async t => {
  await connection.exec(`
    insert into charts
      (id, queryId, type, xColumn, yColumns, groupColumn, stacking, updatedAt, createdAt)
    values
      (1, 100, 'bar', 'x', '["a","b"]', "g", 1, '2017-02-01 00:00:00', '2017-01-01 00:00:00')
  `);
  let rows = await Chart.get(1);
  t.deepEqual(rows, {
    id: 1,
    queryId: 100,
    type: 'bar',
    xColumn: 'x',
    yColumns: ['a', 'b'],
    groupColumn: 'g',
    stacking: 1,
    updatedAt: '2017-02-01 00:00:00',
    createdAt: '2017-01-01 00:00:00',
  });
});

test('findOrCreateByQueryId', async t => {
  let queryId = 100;
  let type = 'bar';
  let chart = await Chart.findOrCreateByQueryId({ queryId, type });
  t.is(typeof chart.id, 'number');
  t.is(chart.queryId, queryId);
  t.is(chart.type, type);

  let chart2 = await Chart.findOrCreateByQueryId({ queryId });
  t.is(chart.id, chart2.id);
});

test('create', async t => {
  let queryId = 100;
  let type = 'bar';
  let chart = await Chart.create({ queryId, type });
  t.is(typeof chart.id, 'number');
  t.is(chart.queryId, queryId);
  t.is(chart.type, type);
});

test('update', async t => {
  await connection.exec(`
    insert into charts
      (id, queryId, type, xColumn, yColumns, groupColumn, stacking, updatedAt, createdAt)
    values
      (1, 100, 'bar', 'x', '["a","b"]', "g", 1, '2017-02-01 00:00:00', '2017-01-01 00:00:00')
  `);
  let chart = await Chart.update(1, { xColumn: 'new', yColumns: ['c', 'd'] });
  t.is(chart.xColumn, 'new');
  t.deepEqual(chart.yColumns, ['c', 'd']);
});
