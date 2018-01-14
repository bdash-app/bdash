export default class Base {
  config: any;

  static get key(): string { throw new Error('Not Implemented'); }
  static get label(): string { throw new Error('Not Implemented'); }

  constructor(config) {
    this.config = config;
  }

  execute(query) {
    throw new Error('Not Implemented');
  }

  cancel() {
    throw new Error('Not Implemented');
  }

  connectionTest() {
    throw new Error('Not Implemented');
  }

  fetchTables() {
    throw new Error('Not Implemented');
  }

  fetchTableSummary(args) {
    throw new Error('Not Implemented');
  }
}
