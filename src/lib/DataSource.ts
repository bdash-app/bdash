import Base from "./DataSourceDefinition/Base";
import Mysql from "./DataSourceDefinition/Mysql";
import Postgres from "./DataSourceDefinition/Postgres";
import BigQuery from "./DataSourceDefinition/BigQuery";
import TreasureData from "./DataSourceDefinition/TreasureData";
import Athena from "./DataSourceDefinition/Athena";
import SQLite3 from "./DataSourceDefinition/SQLite3";
import { DataSourceType } from "../renderer/pages/DataSource/DataSourceStore";

type DataSourceClasses =
  | typeof Mysql
  | typeof Postgres
  | typeof BigQuery
  | typeof TreasureData
  | typeof Athena
  | typeof SQLite3;

export default class DataSource {
  static dataSources: { [dataSourceName: string]: DataSourceClasses };

  static register(...classes: DataSourceClasses[]) {
    const dataSources: { [dataSourceName: string]: DataSourceClasses } = {};

    classes.forEach(DataSource => {
      dataSources[DataSource.key] = DataSource;
    });

    this.dataSources = Object.assign({}, this.dataSources, dataSources);
  }

  static get list(): DataSourceClasses[] {
    return Object.values(this.dataSources);
  }

  static get(type: string): DataSourceClasses {
    return this.dataSources[type];
  }

  static create({ type, config }: Pick<DataSourceType, "type" | "config">): Base {
    return new this.dataSources[type](config);
  }
}

DataSource.register(Mysql, Postgres, BigQuery, TreasureData, Athena, SQLite3);
