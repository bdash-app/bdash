export default class Base {
  constructor(config) {
    this.config = config;
  }

  connectionTest() {
    throw new Error('Not Implemented');
  }

  execute() {
    throw new Error('Not Implemented');
  }

  cancel() {
    throw new Error('Not Implemented');
  }

  fetchTables() {
    throw new Error('Not Implemented');
  }

  fetchTableSummary() {
    throw new Error('Not Implemented');
  }
}
