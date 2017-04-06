import test from 'ava';
import DatabaseHelper from '../../helpers/DatabaseHelper';
import DataSource from '../../../app/lib/Database/DataSource';

test.beforeEach(t => {
  t.context.db = new DatabaseHelper();
});

test('findAll', async t => {
  await t.context.db.connection.exec(`
    insert into data_sources
      (id, name, type, config, updatedAt, createdAt)
    values
      (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00'),
      (2, 'name 2', 'mysql', '{"foo":"bar"}', '2017-02-02 00:00:00', '2017-01-02 00:00:00')
  `);
  let rows = await DataSource.getAll();
  t.deepEqual(rows, [
    { id: 2, name: 'name 2', type: 'mysql', config: { foo: 'bar' } },
    { id: 1, name: 'name 1', type: 'mysql', config: { foo: 'bar' } },
  ]);
});

test('find', async t => {
  await t.context.db.connection.exec(`
    insert into data_sources
      (id, name, type, config, updatedAt, createdAt)
    values
      (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00')
  `);
  let dataSource = await DataSource.find(1);
  t.deepEqual(dataSource, {
    id: 1,
    name: 'name 1',
    type: 'mysql',
    config: { foo: 'bar' },
    updatedAt: '2017-02-01 00:00:00',
    createdAt: '2017-01-01 00:00:00',
  });
});

test('count', async t => {
  await t.context.db.connection.exec(`
    insert into data_sources
      (id, name, type, config, updatedAt, createdAt)
    values
      (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00'),
      (2, 'name 2', 'mysql', '{"foo":"bar"}', '2017-02-02 00:00:00', '2017-01-02 00:00:00')
  `);
  let count = await DataSource.count();
  t.is(count, 2);
});

test('create', async t => {
  let name = 'name';
  let type = 'mysql';
  let config = { foo: 'bar' };
  let dataSource = await DataSource.create({ name, type, config });
  t.is(typeof dataSource.id, 'number');
  t.is(dataSource.name, name);
  t.is(dataSource.type, type);
  t.deepEqual(dataSource.config, { foo: 'bar' });
});

test('update', async t => {
  await t.context.db.connection.exec(`
    insert into data_sources
      (id, name, type, config, updatedAt, createdAt)
    values
      (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00')
  `);
  await DataSource.update(1, { name: 'updated', type: 'postgres', config: { a: 'b' } });
  let dataSource = await DataSource.find(1);
  t.is(dataSource.name, 'updated');
  t.is(dataSource.type, 'postgres');
  t.deepEqual(dataSource.config, { a: 'b' });
});

test('del', async t => {
  await t.context.db.connection.exec(`
    insert into data_sources
      (id, name, type, config, updatedAt, createdAt)
    values
      (1, 'name 1', 'mysql', '{"foo":"bar"}', '2017-02-01 00:00:00', '2017-01-01 00:00:00')
  `);
  await DataSource.del(1);
  let count = await DataSource.count();
  t.is(count, 0);
});
