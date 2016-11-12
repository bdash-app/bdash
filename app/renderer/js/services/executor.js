import Mysql from '../DataSourceDefinition/Mysql';
import Postgres from '../DataSourceDefinition/Postgres';

export default class Executor {
  static register(...executorsClasses) {
    let executors = {};

    executorsClasses.forEach(executor => {
      executors[executor.key] = executor;
    });

    this.executors = Object.assign({}, this.executors, executors);
  }

  static get list() {
    return Object.values(this.executors);
  }

  static create(type, config) {
    return new this.executors[type](config);
  }
}

Executor.register(
  Mysql,
  Postgres
);
