import { BdashDatabase } from "../database.js";

type ListQueriesArgs = {
  limit?: number;
};

function normalizeLimit(input: unknown): number {
  const DEFAULT_LIMIT = 100;
  const MAX_LIMIT = 200;

  if (typeof input !== "number" || !Number.isFinite(input)) {
    return DEFAULT_LIMIT;
  }

  const limit = Math.trunc(input);
  if (limit < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(limit, MAX_LIMIT);
}

export async function listQueries(
  db: BdashDatabase,
  args: ListQueriesArgs = {}
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    const limit = normalizeLimit(args.limit);
    const queries = await db.getQueries(limit);
    const result = {
      queries: queries.map((q) => ({
        id: q.id,
        title: q.title,
        body: q.body,
        dataSourceId: q.dataSourceId,
        createdAt: q.createdAt,
      })),
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: `Failed to connect to Bdash database: ${message}` }], isError: true };
  }
}
