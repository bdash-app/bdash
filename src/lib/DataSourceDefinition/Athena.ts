import AthenaClient from "../AthenaClient";
import Base from "./Base";
import Util from "../Util";

export default class Athena extends Base {
  client: AthenaClient;

  static get key() {
    return "athena";
  }
  static get label() {
    return "Amazon Athena";
  }
  static get configSchema() {
    return [
      {
        name: "region",
        label: "Region",
        type: "string",
        placeholder: "us-east-1",
        required: true
      },
      {
        name: "accessKeyId",
        label: "Access key ID",
        type: "string"
      },
      {
        name: "secretAccessKey",
        label: "Secret access key",
        type: "string"
      },
      {
        name: "database",
        label: "Database",
        type: "string",
        required: true
      },
      {
        name: "outputLocation",
        label: "Query result location",
        type: "string",
        placeholder: "s3://query-results-bucket/prefix/",
        required: true
      }
    ];
  }

  constructor(config) {
    super(config);
    this.client = new AthenaClient(this.config);
  }

  async execute(query: string) {
    const rows = await this.client.execute(query);
    const fields = rows.shift();
    return { fields, rows };
  }

  cancel() {
    return this.client.cancel();
  }

  async connectionTest() {
    await this.client.execute("select 1");
    return;
  }

  async fetchTables() {
    const rows = await this.client.execute("show tables");
    return rows.map(row => ({ name: row[0], type: "table" }));
  }

  async fetchTableSummary({ name }) {
    const rows = await this.client.execute(`describe ${name}`);
    const defs = {
      fields: ["name", "type"],
      rows: rows
        .map(row => row[0])
        .filter(v => v !== null && v[0] !== "#" && v.trim() !== "")
        .map(v => (v || "").split("\t").map(c => c.trim()))
    };

    return { name, defs };
  }

  descriptionTable() {
    return Util.stripHeredoc(`
      |region|${this.config.region}|
      |database|${this.config.database}|
    `);
  }
}
