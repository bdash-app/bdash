export default abstract class Base {
  config: any;

  static get key(): string {
    throw new Error("Not Implemented");
  }
  static get label(): string {
    throw new Error("Not Implemented");
  }

  constructor(config) {
    this.config = config;
  }

  abstract execute(query);

  abstract cancel();

  abstract connectionTest();

  abstract fetchTables();

  abstract fetchTableSummary(args);
}
