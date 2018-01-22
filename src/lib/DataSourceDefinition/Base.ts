export default class Base {
  config: any; // eslint-disable-line no-undef

  static get key(): string {
    throw new Error("Not Implemented");
  }
  static get label(): string {
    throw new Error("Not Implemented");
  }

  constructor(config) {
    this.config = config;
  }

  // eslint-disable-next-line no-unused-vars
  execute(query) {
    throw new Error("Not Implemented");
  }

  cancel() {
    throw new Error("Not Implemented");
  }

  connectionTest() {
    throw new Error("Not Implemented");
  }

  fetchTables() {
    throw new Error("Not Implemented");
  }

  // eslint-disable-next-line no-unused-vars
  fetchTableSummary(args) {
    throw new Error("Not Implemented");
  }
}
