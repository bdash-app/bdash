import { BdashDatabase } from "../database.js";

export async function createQuery(
  db: BdashDatabase,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  if (args.dataSourceId === undefined || args.dataSourceId === null) {
    return { content: [{ type: "text", text: "dataSourceId is required" }], isError: true };
  }

  const dataSourceId = Number(args.dataSourceId);
  const title = args.title !== undefined ? String(args.title) : "New Query";
  const body = args.body !== undefined ? String(args.body) : "";

  try {
    const query = await db.createQuery(dataSourceId, title, body);
    const result = {
      id: query.id,
      title: query.title,
      body: query.body,
      dataSourceId: query.dataSourceId,
      createdAt: query.createdAt,
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}
