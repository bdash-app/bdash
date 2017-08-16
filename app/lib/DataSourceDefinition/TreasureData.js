import TD from 'td';
import Base from './Base';
import Util from '../Util';

const WAIT_INTERVAL = 2000;

let cacheTableList;

export default class TreasureData extends Base {
  static get key() { return 'treasuredata'; }
  static get label() { return 'TreasureData'; }
  static get configSchema() {
    return [
      { name: 'database', label: 'Database', type: 'string', required: true },
      { name: 'apiKey', label: 'API key', type: 'string', placeholder: 'Your API key', required: true },
      { name: 'queryType', label: 'Query Type', type: 'radio', values: ['hive', 'presto'], default: 'hive' },
    ];
  }

  execute(query) {
    if (this.jobId) {
      return Promise.reject(new Error('A query is running'));
    }

    return new Promise(async (resolve, reject) => {
      let canceled = false;
      this._cancel = () => {
        canceled = true;
        reject(new Error('Killed query'));
      };

      this.jobId = await this._execQuery(query);

      if (canceled) {
        this.kill();
        this.jobId = null;
        return;
      }

      let { fields, rows, err } = await this.wait();
      this.jobId = null;

      if (err) {
        reject(new Error(err));
      }
      else {
        resolve({ fields, rows });
      }
    });
  }

  cancel() {
    this._cancel && this._cancel();
    this.kill();
  }

  kill() {
    if (!this.jobId) return;
    this.client.kill(this.jobId, err => {
      if (err) console.error(err);
    });
  }

  async connectionTest() {
    await this._execQuery('select 1');
    return true;
  }

  fetchTables() {
    return new Promise((resolve, reject) => {
      return this.client.listTables(this.config.database, (err, list) => {
        if (err) {
          reject(err);
        }
        else {
          cacheTableList = list;
          resolve(list.tables.map(v => ({ name: v.name, type: 'table' })));
        }
      });
    });
  }

  async fetchTableSummary({ name }) {
    let table = cacheTableList.tables.find( t => t.name === name);
    let fields = ['column', 'type'];
    let rows =  JSON.parse(table.schema);
    return { name, defs: { fields, rows } };
  }

  async wait() {
    let sleep = interval => new Promise(resolve => setTimeout(resolve, interval));
    let showJob = () => new Promise((resolve, reject) => {
      this.client.showJob(this.jobId, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });
    let jobResult = () => new Promise((resolve, reject) => {
      this.client.jobResult(this.jobId, 'json', (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result);
        }
      });
    });

    while (true) {
      let result = await showJob();
      let status = result.status;

      switch (status) {
        case 'success': {
          let rowsString = await jobResult();
          let rows = rowsString.trim().split('\n').map(line => {
            return JSON.parse(line).map(v => {
              return v === null || typeof v !== 'object' ? v : JSON.stringify(v);
            });
          });
          let fields = JSON.parse(result.hive_result_schema).map(f => f[0]);
          return { fields, rows, status };
        }
        case 'error': {
          return { err: result.debug.stderr };
        }
        case 'killed': {
          return { err: 'Killed query' };
        }
        default: {
          await sleep(WAIT_INTERVAL);
        }
      }
    }
  }

  get client() {
    if (!this._client) {
      this._client = new TD(this.config.apiKey);
    }

    return this._client;
  }

  _execQuery(query) {
    return new Promise((resolve, reject) => {
      let method = this.config.queryType === 'presto' ? 'prestoQuery' : 'hiveQuery';
      this.client[method](this.config.database, query, (err, result) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(result.job_id);
        }
      });
    });
  }

  description() {
    return Util.stripHeredoc(`
      database: ${this.config.database}
      queryType: ${this.config.queryType}
    `);
  }
}
