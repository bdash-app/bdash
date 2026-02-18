import { BdashDatabase } from "../database.js";
import { SchemaFetcher } from "../schema-fetcher.js";

export async function listTables(
  db: BdashDatabase,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  if (args.dataSourceId === undefined || args.dataSourceId === null) {
    return { content: [{ type: "text", text: "dataSourceId is required" }], isError: true };
  }

  const dataSourceId = Number(args.dataSourceId);
  const dataSource = await db.getDataSource(dataSourceId);

  if (!dataSource) {
    return { content: [{ type: "text", text: `DataSource not found: ${dataSourceId}` }], isError: true };
  }

  try {
    const fetcher = SchemaFetcher.create(dataSource);
    const tables = await fetcher.fetchTables();
    const result = { tables };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Failed to connect to data source: ${dataSource.name}: ${message}` }],
      isError: true,
    };
  }
}
