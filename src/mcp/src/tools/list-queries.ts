import { BdashDatabase } from "../database.js";

export async function listQueries(
  db: BdashDatabase
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    const queries = await db.getAllQueries();
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
