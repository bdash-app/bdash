import { find, last } from 'lodash';

export default function findQueryByLine(sql, line) {
  let chunks = splitQuery(sql);

  if (chunks.length === 0) return '';
  if (chunks.length === 1) return chunks[0].query;

  let chunk = find(chunks, chunk => chunk.end >= line);
  return chunk ? chunk.query : last(chunks).query;
}

function splitQuery(sql) {
  let lines = sql.replace(/\s+$/, '').split('\n');
  let chunks = [];
  let chunk = null;

  lines.forEach((line, i) => {
    if (!chunk) {
      chunk = { query: '', end: null };
      chunks.push(chunk);
    }

    chunk.query += `${line}\n`;

    if (/;\s*$/.test(line)) {
      chunk.end = i + 1;
      chunk = null;
    }
  });

  return chunks.map(chunk => ({ query: chunk.query.trim(), end: chunk.end }));
}
