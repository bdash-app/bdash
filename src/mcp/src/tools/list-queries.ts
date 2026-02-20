import { BdashDatabase } from "../database.js";

function normalizeLimit(limit: number): number {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  if (!Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }

  const normalized = Math.trunc(limit);
  if (normalized < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(normalized, MAX_LIMIT);
}

export async function listQueries(
  db: BdashDatabase,
  args: Record<string, unknown> = {}
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    const limit = normalizeLimit(Number(args.limit));
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
