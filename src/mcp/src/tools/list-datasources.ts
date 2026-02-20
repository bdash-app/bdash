import { BdashDatabase } from "../database.js";

export async function listDatasources(
  db: BdashDatabase
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    const dataSources = await db.getAllDataSources();
    const result = {
      dataSources: dataSources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        type: ds.type,
      })),
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: `Failed to connect to Bdash database: ${message}` }], isError: true };
  }
}
