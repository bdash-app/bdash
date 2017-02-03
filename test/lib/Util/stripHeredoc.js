import test from 'ava';
import stripHeredoc from '../../../app/lib/Util/stripHeredoc';

test('strip indentation in heredoc', t => {
  let str = `
    foo
      bar
    baz
  `;
  let expected = 'foo\n  bar\nbaz';
  t.is(stripHeredoc(str), expected);
});
