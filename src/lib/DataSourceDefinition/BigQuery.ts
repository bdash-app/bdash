import bigquery from "@google-cloud/bigquery";
import Base from "./Base";
import { flatten } from "lodash";

export default class BigQuery extends Base {
  _cancel: any;

  static get key() {
    return "bigquery";
  }
  static get label() {
    return "BigQuery";
  }
  static get configSchema() {
    return [
      {
        name: "project",
        label: "Project",
        type: "string",
        placeholder: "your-project-id"
      },
      {
        name: "keyFilename",
        label: "JSON Key File",
        type: "string",
        placeholder: "/path/to/keyfile.json"
      }
    ];
  }

  execute(query) {
    this._cancel = null;
    return new Promise((resolve, reject) => {
      bigquery(this.config).startQuery(query, (err, job) => {
        if (err) return reject(err);

        this._cancel = async () => {
          await job.cancel();
          reject(new Error("Query is canceled"));
        };

        job.getQueryResults((err, rows) => {
          if (err) return reject(err);
          if (rows.length === 0) return resolve({});

          resolve({
            fields: Object.keys(rows[0]),
            rows: rows.map(Object.values)
          });
        });
      });
    });
  }

  cancel() {
    return this._cancel && this._cancel();
  }

  async connectionTest() {
    await bigquery(this.config).query("select 1");
    return true;
  }

  async fetchTables() {
    const [datasets] = await bigquery(this.config).getDatasets();
    const promises = datasets.map(async dataset => {
      const [tables] = await dataset.getTables();
      return tables.map(table => ({
        schema: dataset.id,
        name: table.id,
        type: table.metadata.type.toLowerCase()
      }));
    });
    const results = await Promise.all(promises);
    return flatten(results);
  }

  async fetchTableSummary({ schema, name }) {
    const [metadata] = await bigquery(this.config)
      .dataset(schema)
      .table(name)
      .getMetadata();
    const schemaFields = metadata.schema.fields;
    const defs = {
      fields: Object.keys(schemaFields[0]),
      rows: schemaFields.map(Object.values)
    };
    return { schema, name, defs };
  }

  descriptionTable() {
    return `|project|${this.config.project}|`;
  }
}
