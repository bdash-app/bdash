import { find, last } from 'lodash';

export default function findQueryByLine(sql, line) {
  let chunks = splitQuery(sql);

  if (chunks.length === 0) return '';
  if (chunks.length === 1) return chunks[0].query;

  let chunk = find(chunks, chunk => chunk.endLine >= line) || last(chunks);

  return { query: chunk.query, startLine: chunk.startLine };
}

function splitQuery(sql) {
  let lines = sql.replace(/\s+$/, '').split('\n');
  let chunks = [];
  let chunk = null;

  lines.forEach((line, i) => {
    if (!chunk) {
      chunk = { query: '', startLine: i + 1, endLine: null };
      chunks.push(chunk);
    }

    chunk.query += `${line}\n`;

    if (/;\s*$/.test(line)) {
      chunk.endLine = i + 1;
      chunk = null;
    }
  });

  return chunks.map(chunk => {
    let query = chunk.query;
    let startLine = chunk.startLine;
    let m = query.match(/^\s+/g);

    if (m) {
      startLine += m[0].split('\n').length - 1;
    }

    return {
      query: query.trim(),
      startLine: startLine,
      endLine: chunk.endLine,
    };
  });
}
