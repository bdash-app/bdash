import { BdashDatabase } from "../database.js";
import { SchemaFetcher } from "../schema-fetcher.js";

export async function getTableSchema(
  db: BdashDatabase,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  if (args.dataSourceId === undefined || args.dataSourceId === null) {
    return { content: [{ type: "text", text: "dataSourceId is required" }], isError: true };
  }

  if (args.table === undefined || args.table === null) {
    return { content: [{ type: "text", text: "table is required" }], isError: true };
  }

  const dataSourceId = Number(args.dataSourceId);
  const tableName = String(args.table);

  const dataSource = await db.getDataSource(dataSourceId);
  if (!dataSource) {
    return { content: [{ type: "text", text: `DataSource not found: ${dataSourceId}` }], isError: true };
  }

  try {
    const fetcher = SchemaFetcher.create(dataSource);

    // Parse table identifier (could be "table" or "schema.table")
    const parts = tableName.split(".");
    const tableInfo = parts.length === 2 ? { schema: parts[0], name: parts[1] } : { name: tableName };

    const summary = await fetcher.fetchTableSummary(tableInfo);

    // Convert defs format to structured columns
    const columns = summary.defs.rows.map((row) => {
      const col: Record<string, string | null> = {};
      summary.defs.fields.forEach((field, i) => {
        col[field] = row[i];
      });
      return col;
    });

    const result = {
      table: summary.name,
      schema: summary.schema,
      columns,
    };

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("not found") || message.includes("does not exist")) {
      return { content: [{ type: "text", text: `Table not found: ${tableName}` }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Failed to connect to data source: ${dataSource.name}: ${message}` }],
      isError: true,
    };
  }
}
