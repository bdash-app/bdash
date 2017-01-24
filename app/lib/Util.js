import _ from 'lodash';

export default {
  stripHeredoc(str) {
    str = str.trim();
    let margins = (str.match(/^ +/mg) || []).map(s => s.length);
    let margin = Math.min(...margins);

    return str.replace(new RegExp(`^ {${margin}}`, 'gm'), '');
  },

  findQueryByLine(sql, line) {
    let chunks = this.splitQuery(sql);

    if (chunks.length === 0) return '';
    if (chunks.length === 1) return chunks[0].query;

    let chunk = _.find(chunks, chunk => chunk.end >= line);
    return chunk ? chunk.query : _.last(chunks).query;
  },

  splitQuery(sql) {
    let lines = sql.replace(/\s+$/, '').split('\n');
    let chunks = [];
    let chunk = null;

    lines.forEach((line, i) => {
      if (!chunk) {
        chunk = { query: '', end: null };
        chunks.push(chunk);
      }

      chunk.query += `${line}\n`;

      if (/;$/.test(line)) {
        chunk.end = i + 1;
        chunk = null;
      }
    });

    return chunks.map(chunk => ({ query: chunk.query.trim(), end: chunk.end }));
  },
};
