import axios, { AxiosInstance } from "axios";
import Base, { ConfigSchemasType, TableSummary } from "./Base";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";
import { Language } from "@hokaccha/sql-formatter";

interface DatabricksStatementResponse {
  statement_id: string;
  status: {
    state: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED";
  };
  manifest?: {
    format: string;
    schema: {
      columns: Array<{
        name: string;
        type_name: string;
      }>;
    };
  };
  result?: {
    data_array?: any[][];
    chunk_index?: number;
    row_count?: number;
    row_offset?: number;
  };
}

export default class Databricks extends Base {
  private static readonly POLL_MAX_ATTEMPTS = 60; // 5 minutes with 5 second intervals
  private static readonly POLL_INTERVAL_MS = 5000; // 5 seconds
  private static readonly QUERY_TIMEOUT_MS = 10000; // 10 seconds wait timeout for statement execution

  private client: AxiosInstance;
  private currentStatementId: string | null = null;

  static override get key(): DataSourceKeys {
    return "databricks";
  }

  static override get label(): string {
    return "Databricks";
  }

  static override get formatType(): Language {
    return "sql";
  }

  static override get configSchema(): ConfigSchemasType {
    return [
      {
        name: "serverHostname",
        label: "Server Hostname",
        type: "string",
        placeholder: "your-workspace.databricks.com",
        required: true,
      },
      {
        name: "httpPath",
        label: "HTTP Path",
        type: "string",
        placeholder: "/sql/1.0/warehouses/your-warehouse-id",
        required: true,
      },
      {
        name: "personalAccessToken",
        label: "Personal Access Token",
        type: "password",
        required: true,
      },
      {
        name: "catalog",
        label: "Catalog",
        type: "string",
        placeholder: "main",
        default: "main",
      },
      {
        name: "schema",
        label: "Schema",
        type: "string",
        placeholder: "default",
        default: "default",
      },
    ];
  }

  constructor(config: any) {
    super(config);
    this.client = axios.create({
      baseURL: `https://${this.config.serverHostname}/api/2.0`,
      headers: {
        Authorization: `Bearer ${this.config.personalAccessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  async execute(query: string, options: any = {}): Promise<any> {
    let statementId: string | null = null;

    try {
      // Execute SQL statement
      const executeResponse = await this.client.post("/sql/statements", {
        statement: query,
        warehouse_id: this.extractWarehouseId(),
        catalog: this.config.catalog || "main",
        schema: this.config.schema || "default",
        wait_timeout: `${Databricks.QUERY_TIMEOUT_MS / 1000}s`,
      });

      statementId = executeResponse.data.statement_id;
      this.currentStatementId = statementId;

      // Poll for completion
      if (!statementId) {
        throw new Error("Statement ID is null");
      }
      const result = await this.pollForCompletion(statementId);

      if (result.status.state === "FAILED") {
        throw new Error(`Query failed: ${JSON.stringify(result)}`);
      }

      if (!result.manifest || !result.result) {
        throw new Error("No result data returned from Databricks");
      }

      const fields = result.manifest.schema.columns.map((col) => col.name);
      const rows = result.result.data_array || [];

      return { fields, rows };
    } catch (err: any) {
      throw this._errorWithLine(err, query, options.startLine || 1);
    } finally {
      // Only clear currentStatementId if it matches the current statement
      if (this.currentStatementId === statementId) {
        this.currentStatementId = null;
      }
    }
  }

  async cancel(): Promise<void> {
    if (!this.currentStatementId) {
      console.log("Databricks cancel: No active statement to cancel");
      return Promise.resolve();
    }

    const statementIdToCancel = this.currentStatementId;
    console.log(`Databricks cancel: Attempting to cancel statement ${statementIdToCancel}`);

    try {
      await this.client.post(`/sql/statements/${statementIdToCancel}/cancel`);
      console.log(`Databricks cancel: Successfully sent cancel request for statement ${statementIdToCancel}`);
    } catch (err: any) {
      console.warn(`Databricks cancel: Failed to cancel statement ${statementIdToCancel}:`, err.message);
    } finally {
      this.currentStatementId = null;
    }
  }

  async connectionTest(): Promise<any> {
    await this.execute("SELECT 1 as test");
    return true;
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const catalog = this.config.catalog || "main";

    try {
      const schemasQuery = `SHOW SCHEMAS IN ${catalog}`;
      const { rows: schemaRows } = await this.execute(schemasQuery);

      const schemaPromises = schemaRows.map(async (schemaRow) => {
        const schemaName = schemaRow[0]; // schema name is in first column

        try {
          const tablesQuery = `SHOW TABLES IN ${catalog}.${schemaName}`;
          const { rows: tableRows } = await this.execute(tablesQuery);

          return tableRows.map((row) => ({
            name: row[1], // table name is in second column
            type: "TABLE", // SHOW TABLES doesn't distinguish types, assume TABLE
            schema: schemaName,
          }));
        } catch (err) {
          console.warn(`Could not access tables in schema ${schemaName}:`, err);
          return [];
        }
      });

      const results = await Promise.all(schemaPromises);
      return results.flat();
    } catch (err) {
      console.warn("Could not fetch tables:", err);
      return [];
    }
  }

  async fetchTableSummary({ schema, name }: { schema: string; name: string }): Promise<TableSummary> {
    const catalog = this.config.catalog || "main";
    const query = `DESCRIBE TABLE ${catalog}.${schema}.${name}`;

    const result = await this.execute(query);
    const defs = {
      fields: ["col_name", "data_type", "comment"],
      rows: result.rows,
    };

    return { schema, name, defs };
  }

  dataSourceInfo(): Record<string, any> {
    return {
      type: Databricks.label,
      serverHostname: this.config.serverHostname,
      httpPath: this.config.httpPath,
      catalog: this.config.catalog || "main",
      schema: this.config.schema || "default",
    };
  }

  private extractWarehouseId(): string {
    // Extract warehouse ID from HTTP path like "/sql/1.0/warehouses/abc123def456"
    const match = this.config.httpPath.match(/\/warehouses\/([^/]+)/);
    if (!match) {
      throw new Error("Could not extract warehouse ID from HTTP path");
    }
    return match[1];
  }

  private async pollForCompletion(statementId: string): Promise<DatabricksStatementResponse> {
    let attempts = 0;

    while (attempts < Databricks.POLL_MAX_ATTEMPTS) {
      // Check if this statement was cancelled
      if (this.currentStatementId !== statementId) {
        throw new Error("Query was cancelled");
      }

      const response = await this.client.get(`/sql/statements/${statementId}`);
      const data: DatabricksStatementResponse = response.data;

      if (data.status.state === "SUCCEEDED" || data.status.state === "FAILED" || data.status.state === "CANCELED") {
        return data;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, Databricks.POLL_INTERVAL_MS));
      attempts++;
    }

    throw new Error(
      `Query timed out after ${(Databricks.POLL_MAX_ATTEMPTS * Databricks.POLL_INTERVAL_MS) / 60000} minutes`
    );
  }

  private _errorWithLine(err: any, _query: string, startLine: number): Error {
    let message = err.message || "Unknown error";

    if (err.response?.data?.message) {
      message = err.response.data.message;
    }

    // Try to extract line number from Databricks error if available
    const lineMatch = message.match(/line (\d+)/i);
    if (lineMatch) {
      const errorLine = parseInt(lineMatch[1]) + startLine - 1;
      message += ` (line: ${errorLine})`;
    }

    return new Error(message);
  }
}
