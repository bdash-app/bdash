import { last } from "lodash";
import { runMode } from "codemirror";
import "codemirror/addon/runmode/runmode";
import "codemirror/mode/sql/sql";

interface QueryChunk {
  query: string;
  startLine: number;
  endLine: number;
}

export default async function findQueryByLine(sql: string, mimeType: string, line: number): Promise<QueryChunk> {
  const chunks = await splitQuery(sql, mimeType);
  const chunk = chunks.find((chunk) => chunk.endLine >= line) ?? last(chunks);

  if (!chunk) {
    return {
      query: "",
      startLine: 2,
      endLine: 1,
    };
  }
  return {
    query: chunk.query,
    startLine: chunk.startLine,
    endLine: chunk.endLine,
  };
}

const splitQuery = (sql: string, mimeType: string): Promise<QueryChunk[]> => {
  return new Promise((resolve) => {
    let startLine = 1;
    let line = 1;
    let query = "";
    const chunks: QueryChunk[] = [];
    runMode(sql, mimeType, (token, style) => {
      if (token === ";") {
        query += token;
        chunks.push({ query, startLine, endLine: line });
        query = "";
        startLine = line;
      } else if (style === "comment") {
        query += token;
      } else {
        if (token === "\n") {
          line++;
          if (query.length === 0) {
            startLine++;
          }
        }
        if (query === "") {
          // Add the first token to query even if it is not considered as keyword by CodeMirror
          query += token.trim();
        } else {
          query += token;
        }
      }
    });
    if (query.length > 0) {
      chunks.push({ query, startLine, endLine: line });
    }
    resolve(chunks);
  });
};
