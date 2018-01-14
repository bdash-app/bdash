import Mysql from './DataSourceDefinition/Mysql';
import Postgres from './DataSourceDefinition/Postgres';
import BigQuery from './DataSourceDefinition/BigQuery';
import TreasureData from './DataSourceDefinition/TreasureData';

export default class DataSource {
  static register(...classes) {
    let dataSources = {};

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

DataSource.register(
  Mysql,
  Postgres,
  BigQuery,
  TreasureData
);
