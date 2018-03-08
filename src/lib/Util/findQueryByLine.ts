import { find, last } from "lodash";

interface QueryChunk {
  query: string;
  startLine: number;
  endLine: number;
}

export default function findQueryByLine(sql: string, line: number): QueryChunk {
  const chunks = splitQuery(sql);
  const chunk = find(chunks, chunk => chunk.endLine >= line) || last(chunks);

  return {
    query: chunk.query,
    startLine: chunk.startLine,
    endLine: chunk.endLine
  };
}

function splitQuery(sql: string): QueryChunk[] {
  const lines = sql.replace(/\s+$/, "").split("\n");
  const chunks: QueryChunk[] = [];
  let chunk: any = null;

  lines.forEach((line, i) => {
    if (chunk === null) {
      chunk = { query: "", startLine: i + 1, endLine: null };
      chunks.push(chunk);
    }

    chunk.query += `${line}\n`;

    if (/;\s*$/.test(line)) {
      chunk.endLine = i + 1;
      chunk = null;
    }
  });

  return chunks.map(chunk => {
    const query = chunk.query;
    let startLine = chunk.startLine;
    let endLine = chunk.endLine;
    const m = query.match(/^\s+/g);

    if (m) {
      startLine += m[0].split("\n").length - 1;
    }

    if (endLine === null) {
      endLine = lines.length;
    }

    return {
      query: query.trim(),
      startLine: startLine,
      endLine: endLine
    };
  });
}
