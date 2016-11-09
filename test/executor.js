import assert from 'assert';
import Executor from '../app/renderer/js/services/executor';

describe('Executor', () => {
  it('splitQuery 1', () => {
    let sql = `

select a
from b;

select 1
;


select 2
from c`;
    let chunks = Executor.splitQuery(sql);

    assert.equal(chunks.length, 3);

    assert.equal(chunks[0].query, 'select a\nfrom b;');
    assert.equal(chunks[0].end, 4);

    assert.equal(chunks[1].query, 'select 1\n;');
    assert.equal(chunks[1].end, 7);

    assert.equal(chunks[2].query, 'select 2\nfrom c');
    assert.equal(chunks[2].end, null);
  });

  it('splitQuery 2', () => {
    let sql = 'select * from users';
    let queries = Executor.splitQuery(sql);

    assert.equal(queries.length, 1);
    assert.equal(queries[0].query, 'select * from users');
    assert.equal(queries[0].end, null);
  });

  it('splitQuery 3', () => {
    let sql = 'select * from users;';
    let queries = Executor.splitQuery(sql);

    assert.equal(queries.length, 1);
    assert.equal(queries[0].query, 'select * from users;');
    assert.equal(queries[0].end, 1);
  });

  it('findQueryByLine 1', () => {
    let sql = `

select a
from b;

select 1
;


select 2
from c`;
    let sql1 = 'select a\nfrom b;';
    let sql2 = 'select 1\n;';
    let sql3 = 'select 2\nfrom c';

    assert.equal(Executor.findQueryByLine(sql, 1), sql1);
    assert.equal(Executor.findQueryByLine(sql, 2), sql1);
    assert.equal(Executor.findQueryByLine(sql, 3), sql1);
    assert.equal(Executor.findQueryByLine(sql, 4), sql1);
    assert.equal(Executor.findQueryByLine(sql, 5), sql2);
    assert.equal(Executor.findQueryByLine(sql, 6), sql2);
    assert.equal(Executor.findQueryByLine(sql, 7), sql2);
    assert.equal(Executor.findQueryByLine(sql, 8), sql3);
    assert.equal(Executor.findQueryByLine(sql, 9), sql3);
    assert.equal(Executor.findQueryByLine(sql, 10), sql3);
    assert.equal(Executor.findQueryByLine(sql, 11), sql3);
  });

  it('findQueryByLine 2', () => {
    let sql = `
select 1;
select 2;
`;
    let sql1 = 'select 1;';
    let sql2 = 'select 2;';

    assert.equal(Executor.findQueryByLine(sql, 1), sql1);
    assert.equal(Executor.findQueryByLine(sql, 2), sql1);
    assert.equal(Executor.findQueryByLine(sql, 3), sql2);
    assert.equal(Executor.findQueryByLine(sql, 4), sql2);
  });
});
