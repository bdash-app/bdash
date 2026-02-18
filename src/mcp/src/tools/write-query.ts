import { BdashDatabase } from "../database.js";

export async function writeQuery(
  db: BdashDatabase,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  if (args.id === undefined || args.id === null) {
    return { content: [{ type: "text", text: "id is required" }], isError: true };
  }

  if (args.body === undefined || args.body === null) {
    return { content: [{ type: "text", text: "body is required" }], isError: true };
  }

  const id = Number(args.id);
  const body = String(args.body);

  try {
    const updated = await db.writeQuery(id, body);
    const result = {
      id: updated.id,
      title: updated.title,
      body: updated.body,
      updatedAt: updated.updatedAt,
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}
