import Postgres from "./Postgres";
import Util from "../Util";
import { zipObject } from "lodash";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";
import { TableSummary } from "./Base";

export default class Redshift extends Postgres {
  static get key(): DataSourceKeys {
    return "redshift";
  }

  static get label(): string {
    return "Redshift";
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const query = Util.stripHeredoc(`
      select * from (
          select
              table_schema :: varchar(256) as schema
              , table_name :: varchar(256) as name
              , table_type :: varchar(256) as type
          from
              information_schema.tables
          where
              table_schema not in ('information_schema', 'pg_catalog', 'pg_internal')

          union all

          select
              schemaname as schema
              , tablename as name
              , 'BASE TABLE' as type
          from
              pg_catalog.svv_external_tables
      )
      order by schema, name;
    `);
    const { fields, rows } = await this._execute(query);

    return rows.map((row) => zipObject(fields, row));
  }

  async fetchTableSummary({ schema, name }: { schema: string; name: string }): Promise<TableSummary> {
    const query = Util.stripHeredoc(`
      select
          column_name
          , data_type
          , case is_nullable when 'NO' then 'NO' else 'YES' end as null
          , column_default as default
      from
          svv_columns
      where
          table_schema = $1
          and table_name = $2;
    `);
    const defs = await this._execute(query, schema, name);

    return { schema, name, defs };
  }

  dataSourceInfo(): Record<string, any> {
    return {
      type: Redshift.label,
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      database: this.config.database,
    };
  }
}
