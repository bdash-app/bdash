import test from 'ava';
import stripHeredoc from '../../../src/lib/Util/stripHeredoc';
import findQueryByLine from '../../../src/lib/Util/findQueryByLine';

test(t => {
  let sql = stripHeredoc(`
    select a
    from b;
    -- comment

    select 1
    ;


    select 2
    from c
  `);

  let sql1 = 'select a\nfrom b;';
  let sql2 = '-- comment\n\nselect 1\n;';
  let sql3 = 'select 2\nfrom c';

  t.deepEqual(findQueryByLine(sql, 1), { query: sql1, startLine: 1 });
  t.deepEqual(findQueryByLine(sql, 2), { query: sql1, startLine: 1 });
  t.deepEqual(findQueryByLine(sql, 3), { query: sql2, startLine: 3 });
  t.deepEqual(findQueryByLine(sql, 4), { query: sql2, startLine: 3 });
  t.deepEqual(findQueryByLine(sql, 5), { query: sql2, startLine: 3 });
  t.deepEqual(findQueryByLine(sql, 6), { query: sql2, startLine: 3 });
  t.deepEqual(findQueryByLine(sql, 7), { query: sql3, startLine: 9 });
  t.deepEqual(findQueryByLine(sql, 8), { query: sql3, startLine: 9 });
  t.deepEqual(findQueryByLine(sql, 9), { query: sql3, startLine: 9 });
});

test(t => {
  let sql = '\nselect 1; \nselect 2;\n';
  let sql1 = 'select 1;';
  let sql2 = 'select 2;';

  t.deepEqual(findQueryByLine(sql, 1), { query: sql1, startLine: 2 });
  t.deepEqual(findQueryByLine(sql, 2), { query: sql1, startLine: 2 });
  t.deepEqual(findQueryByLine(sql, 3), { query: sql2, startLine: 3 });
  t.deepEqual(findQueryByLine(sql, 4), { query: sql2, startLine: 3 });
});

test(t => {
  let sql = 'select 1;';
  t.deepEqual(findQueryByLine(sql, 1), { query: 'select 1;', startLine: 1 });
});

test(t => {
  let sql = '\nselect 1;';
  t.deepEqual(findQueryByLine(sql, 1), { query: 'select 1;', startLine: 2 });
});
