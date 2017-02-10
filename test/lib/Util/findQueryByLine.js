import test from 'ava';
import stripHeredoc from '../../../app/lib/Util/stripHeredoc';
import findQueryByLine from '../../../app/lib/Util/findQueryByLine';

test(t => {
  let sql = stripHeredoc(`
    select a
    from b;

    select 1
    ;


    select 2
    from c
  `);

  let sql1 = 'select a\nfrom b;';
  let sql2 = 'select 1\n;';
  let sql3 = 'select 2\nfrom c';

  t.is(findQueryByLine(sql, 1), sql1);
  t.is(findQueryByLine(sql, 2), sql1);
  t.is(findQueryByLine(sql, 3), sql2);
  t.is(findQueryByLine(sql, 4), sql2);
  t.is(findQueryByLine(sql, 5), sql2);
  t.is(findQueryByLine(sql, 6), sql3);
  t.is(findQueryByLine(sql, 7), sql3);
  t.is(findQueryByLine(sql, 8), sql3);
  t.is(findQueryByLine(sql, 9), sql3);
});

test(t => {
  let sql = '\nselect 1; \nselect 2;\n';
  let sql1 = 'select 1;';
  let sql2 = 'select 2;';

  t.is(findQueryByLine(sql, 1), sql1);
  t.is(findQueryByLine(sql, 2), sql1);
  t.is(findQueryByLine(sql, 3), sql2);
  t.is(findQueryByLine(sql, 4), sql2);
});
