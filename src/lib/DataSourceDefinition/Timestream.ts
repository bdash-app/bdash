import * as timestreamquery from "@aws-sdk/client-timestream-query";
import Base, { ConfigSchemasType, TableSummary, TableSummaryRow } from "./Base";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";

export default class Timestream extends Base {
  client: timestreamquery.TimestreamQueryClient;
  database: string;
  queryId?: string;

  static override get key(): DataSourceKeys {
    return "timestream";
  }

  static override get label(): string {
    return "Amazon Timestream";
  }

  static override get configSchema(): ConfigSchemasType {
    return [
      {
        name: "region",
        label: "Region",
        type: "string",
        placeholder: "us-east-1",
        required: true,
      },
      {
        name: "accessKeyId",
        label: "Access key ID",
        type: "string",
        placeholder: "Optional - uses AWS environment/profile if empty",
      },
      {
        name: "secretAccessKey",
        label: "Secret access key",
        type: "string",
        placeholder: "Optional - uses AWS environment/profile if empty",
      },
      {
        name: "database",
        label: "Database",
        type: "string",
        required: true,
      },
    ];
  }

  constructor(config: any) {
    super(config);

    const clientConfig: any = { region: config.region };

    // Only add credentials if BOTH accessKeyId and secretAccessKey are provided.
    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new timestreamquery.TimestreamQueryClient(clientConfig);
    this.database = config.database;
  }

  async connectionTest(): Promise<void> {
    await this.client.send(new timestreamquery.QueryCommand({ QueryString: "select 1" }));
  }

  async execute(query: string): Promise<{ fields: string[]; rows: (string | null)[][] }> {
    const fields: string[] = [];
    const rows: (string | null)[][] = [];
    for await (const page of timestreamquery.paginateQuery({ client: this.client }, { QueryString: query })) {
      this.queryId = page.QueryId;

      if (fields.length === 0 && page.ColumnInfo) {
        for (const column of page.ColumnInfo) {
          fields.push(column.Name!);
        }
      }
      if (page.Rows) {
        for (const row of page.Rows) {
          if (row.Data) {
            // TODO: Support non-scalar data types
            rows.push(row.Data.map((d: timestreamquery.Datum) => d.ScalarValue ?? null));
          }
        }
      }
    }
    this.queryId = undefined;

    return {
      fields,
      rows,
    };
  }

  cancel(): void {
    if (this.queryId) {
      this.client.send(new timestreamquery.CancelQueryCommand({ QueryId: this.queryId }));
    }
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const tables: { name: string; type: string }[] = [];
    for await (const page of timestreamquery.paginateQuery(
      { client: this.client },
      { QueryString: `show tables from "${this.database}"` }
    )) {
      if (page.Rows) {
        for (const row of page.Rows) {
          tables.push({
            type: "table",
            name: row.Data![0].ScalarValue!,
          });
        }
      }
    }
    return tables;
  }

  async fetchTableSummary({ name }: { name: string }): Promise<TableSummary> {
    const rows: TableSummaryRow[][] = [];
    for await (const page of timestreamquery.paginateQuery(
      { client: this.client },
      { QueryString: `describe "${this.database}"."${name}"` }
    )) {
      if (page.Rows) {
        const name2index = {};
        page.ColumnInfo!.forEach((column, index) => (name2index[column.Name!] = index));
        for (const row of page.Rows) {
          if (row.Data) {
            rows.push([
              row.Data[name2index["Column"]].ScalarValue ?? null,
              row.Data[name2index["Type"]].ScalarValue ?? null,
              row.Data[name2index["Timestream attribute type"]].ScalarValue ?? null,
            ]);
          }
        }
      }
    }

    return {
      name,
      defs: {
        fields: ["name", "type", "attribute type"],
        rows: rows,
      },
    };
  }

  dataSourceInfo(): Record<string, any> {
    return {
      type: Timestream.label,
      region: this.config.region,
    };
  }
}
