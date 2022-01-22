import AthenaClient from "../AthenaClient";
import Base, { ConfigSchemasType, TableSummary } from "./Base";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";

export default class Athena extends Base {
  client: AthenaClient;

  static get key(): DataSourceKeys {
    return "athena";
  }
  static get label(): string {
    return "Amazon Athena";
  }
  static get configSchema(): ConfigSchemasType {
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
      },
      {
        name: "secretAccessKey",
        label: "Secret access key",
        type: "string",
      },
      {
        name: "database",
        label: "Database",
        type: "string",
        required: true,
      },
      {
        name: "outputLocation",
        label: "Query result location",
        type: "string",
        placeholder: "s3://query-results-bucket/prefix/",
        required: true,
      },
    ];
  }

  constructor(config) {
    super(config);
    this.client = new AthenaClient(this.config);
  }

  async execute(query: string): Promise<{ fields: any; rows: any }> {
    const rows = await this.client.execute(query);
    const fields = rows.shift();
    return { fields, rows };
  }

  cancel(): void {
    this.client.cancel();
  }

  async connectionTest(): Promise<void> {
    await this.client.execute("select 1");
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const rows = await this.client.execute("show tables");
    return rows.map((row) => ({ name: row[0]!, type: "table" }));
  }

  async fetchTableSummary({ name }: { name: string }): Promise<TableSummary> {
    const rows = await this.client.execute(`describe ${name}`);
    const defs = {
      fields: ["name", "type"],
      rows: rows
        .map((row) => row[0])
        .filter((v) => v !== null && v[0] !== "#" && v.trim() !== "")
        .map((v) => (v || "").split("\t").map((c) => c.trim())),
    };

    return { name, defs };
  }

  dataSourceInfo(): Record<string, any> {
    return {
      type: Athena.label,
      region: this.config.region,
      database: this.config.database,
    };
  }
}
