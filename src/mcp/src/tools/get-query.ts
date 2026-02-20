import { BdashDatabase } from "../database.js";

export async function getQuery(
  db: BdashDatabase,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  if (args.id === undefined || args.id === null) {
    return { content: [{ type: "text", text: "id is required" }], isError: true };
  }

  const id = Number(args.id);
  const query = await db.getQuery(id);

  if (!query) {
    return { content: [{ type: "text", text: `Query not found: ${id}` }], isError: true };
  }

  return { content: [{ type: "text", text: JSON.stringify(query, null, 2) }] };
}
