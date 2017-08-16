export default class Base {
  static get key() { throw new Error('Not Implemented'); }
  static get label() { throw new Error('Not Implemented'); }

  constructor(config) {
    this.config = config;
  }

  execute() {
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

  fetchTableSummary() {
    throw new Error('Not Implemented');
  }

  descriptionTable() {
    throw new Error('Not Implemented');
  }
}
