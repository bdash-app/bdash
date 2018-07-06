import Mysql from "./DataSourceDefinition/Mysql";
import Postgres from "./DataSourceDefinition/Postgres";
import BigQuery from "./DataSourceDefinition/BigQuery";
import TreasureData from "./DataSourceDefinition/TreasureData";
import Athena from "./DataSourceDefinition/Athena";
import SQLite3 from "./DataSourceDefinition/SQLite3";

export default class DataSource {
  static dataSources: any;

  static register(...classes) {
    const dataSources = {};

    classes.forEach(DataSource => {
      dataSources[DataSource.key] = DataSource;
    });

    this.dataSources = Object.assign({}, this.dataSources, dataSources);
  }

  static get list() {
    return Object.values(this.dataSources);
  }

  static get(type) {
    return this.dataSources[type];
  }

  static create({ type, config }) {
    return new this.dataSources[type](config);
  }
}

DataSource.register(Mysql, Postgres, BigQuery, TreasureData, Athena, SQLite3);
