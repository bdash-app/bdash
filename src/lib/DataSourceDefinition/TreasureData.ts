import { TDClient } from "td";
import Base, { ConfigSchemasType, TableSummary } from "./Base";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";

const WAIT_INTERVAL = 2000;

let cacheTableList;

export default class TreasureData extends Base {
  jobId: any;
  _cancel: any;
  _client: any;

  static override get key(): DataSourceKeys {
    return "treasuredata";
  }
  static override get label(): string {
    return "TreasureData";
  }
  static override get configSchema(): ConfigSchemasType {
    return [
      { name: "database", label: "Database", type: "string", required: true },
      {
        name: "apiKey",
        label: "API key",
        type: "string",
        placeholder: "Your API key",
        required: true,
      },
      {
        name: "endpoint",
        label: "Endpoint",
        type: "string",
        placeholder: "api.treasuredata.com",
        required: true,
      },
      {
        name: "queryType",
        label: "Query Type",
        type: "radio",
        values: ["hive", "presto"],
        default: "presto",
      },
    ];
  }

  async execute(query: string): Promise<any> {
    if (this.jobId) {
      return Promise.reject(new Error("A query is running"));
    }

    let canceled = false;
    this._cancel = (): Promise<any> => {
      canceled = true;
      return Promise.reject(new Error("Killed query"));
    };

    this.jobId = await this._execQuery(query);

    if (canceled) {
      this.kill();
      this.jobId = null;
      return;
    }

    const { fields, rows, err } = await this.wait();
    this.jobId = null;

    if (err) {
      return Promise.reject(new Error(err));
    } else {
      return { fields, rows };
    }
  }

  cancel(): void {
    this._cancel && this._cancel();
    this.kill();
  }

  kill(): void {
    if (!this.jobId) return;
    this.client.kill(this.jobId, (err) => {
      if (err) console.error(err); // eslint-disable-line no-console
    });
  }

  async connectionTest(): Promise<any> {
    await this._execQuery("select 1");
    return true;
  }

  fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    return new Promise((resolve, reject) => {
      return this.client.listTables(this.config.database, (err, list) => {
        if (err) {
          reject(err);
        } else {
          cacheTableList = list;
          resolve(list.tables.map((v) => ({ name: v.name, type: "table" })));
        }
      });
    });
  }

  async fetchTableSummary({ name }): Promise<TableSummary> {
    const table = cacheTableList.tables.find((t) => t.name === name);
    const fields = ["column", "type"];
    const rows = JSON.parse(table.schema);
    return { name, defs: { fields, rows } };
  }

  dataSourceInfo(): Record<string, any> {
    return {
      type: TreasureData.label,
      database: this.config.database,
      queryType: this.config.queryType,
    };
  }

  async wait(): Promise<any> {
    const sleep = (interval): Promise<void> => new Promise((resolve) => setTimeout(resolve, interval));
    const showJob = (): Promise<any> =>
      new Promise((resolve, reject) => {
        this.client.showJob(this.jobId, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }) as Promise<any>;
    const jobResult = (): Promise<any> =>
      new Promise((resolve, reject) => {
        this.client.jobResult(this.jobId, "json", (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }) as Promise<any>;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await showJob();
      const status = result.status;

      switch (status) {
        case "success": {
          const fields = JSON.parse(result.hive_result_schema).map((f) => f[0]);
          const rowsString = await jobResult();
          if (typeof rowsString === "object") {
            // rowsString is an object when rows are empty.
            const emptyRows = [] as string[];
            return { fields, emptyRows, status };
          }
          const rows = rowsString
            .trim()
            .split("\n")
            .map((line) => {
              return JSON.parse(line).map((v) => {
                return v === null || typeof v !== "object" ? v : JSON.stringify(v);
              });
            });
          return { fields, rows, status };
        }
        case "error": {
          return { err: result.debug.stderr };
        }
        case "killed": {
          return { err: "Killed query" };
        }
        default: {
          await sleep(WAIT_INTERVAL);
        }
      }
    }
  }

  get client(): TDClient {
    if (!this._client) {
      const options = { protocol: "https" };
      if (this.config.endpoint) {
        options["host"] = this.config.endpoint;
      }
      this._client = new TDClient(this.config.apiKey, options);
    }

    return this._client;
  }

  _execQuery(query): Promise<any> {
    return new Promise((resolve, reject) => {
      const method = this.config.queryType === "presto" ? "prestoQuery" : "hiveQuery";
      this.client[method](this.config.database, query, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.job_id);
        }
      });
    });
  }
}
