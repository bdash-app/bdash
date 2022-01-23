import { DataSourceKeys, TableType } from "../../renderer/pages/DataSource/DataSourceStore";

export type TableSummaryRow = string | null;

export type TableSummary = {
  name: string;
  defs: {
    fields: string[];
    rows: TableSummaryRow[][];
  };
  schema?: string;
};

export default abstract class Base {
  config: any;

  static get key(): DataSourceKeys {
    throw new Error("Not Implemented");
  }
  static get label(): string {
    throw new Error("Not Implemented");
  }
  static get configSchema(): ConfigSchemasType {
    throw new Error("Not Implemented");
  }

  constructor(config) {
    this.config = config;
  }

  abstract execute(query: string, options?: any): Promise<any>;

  // @todo Set return type as Promise<void> ?
  abstract cancel(): void | Promise<void>;

  // @todo Define type of the result (boolean or void ?)
  abstract connectionTest(): Promise<any>;

  abstract fetchTables(): Promise<{ name: string; type: string; schema?: string }[]>;

  abstract dataSourceInfo(): Record<string, any>;

  abstract fetchTableSummary(args: Partial<TableType>): Promise<TableSummary>;

  infoMdTable(): string {
    const info = this.dataSourceInfo();
    const rows = Object.keys(info).map((k) => {
      const v = info[k];
      return `|${k}|${v}|`;
    });
    return rows.join("\n");
  }
}

export type ConfigSchemasType = ConfigSchemaType[];

export type ConfigSchemaType = {
  readonly name: string;
  readonly label: string;
  readonly type: string;
  readonly placeholder?: string | number;
  readonly required?: boolean;
  readonly values?: string[];
  readonly default?: string;
};
