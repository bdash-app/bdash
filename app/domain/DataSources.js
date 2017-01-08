import Mysql from '../DataSourceDefinition/Mysql';
import Postgres from '../DataSourceDefinition/Postgres';

export default class DataSources {
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

  static create(type, config) {
    return new this.dataSources[type](config);
  }
}

DataSources.register(
  Mysql,
  Postgres
);
