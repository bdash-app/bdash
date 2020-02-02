import { TableType } from "../../renderer/pages/DataSource/DataSourceStore";

export default abstract class Base {
  config: any;

  static get key(): string {
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

  abstract descriptionTable(): string;

  abstract fetchTableSummary(
    args: Partial<TableType>
  ): Promise<{ name: string; defs: { fields: string[]; rows: (string | null)[][] }; schema?: string }>;
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
