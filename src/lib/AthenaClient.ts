import Athena from "aws-sdk/clients/athena";
import retry from "./Util/retry";

interface AthenaClientConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  database: string;
  outputLocation: string;
}

type QueryResult = (string | null)[][];

export default class AthenaClient {
  config: AthenaClientConfig;
  client: Athena;
  executionId: string;

  constructor(config: AthenaClientConfig) {
    const { region, accessKeyId, secretAccessKey } = config;
    this.config = config;
    this.client = new Athena({ region, accessKeyId, secretAccessKey });
  }

  async execute(query: string): Promise<QueryResult> {
    const params = {
      QueryString: query,
      ResultConfiguration: {
        OutputLocation: this.config.outputLocation
      },
      QueryExecutionContext: {
        Database: this.config.database
      }
    };

    const { QueryExecutionId } = await this.startQueryExecution(params);
    if (QueryExecutionId === undefined) throw new Error("QueryExecutionId is undefined");
    this.executionId = QueryExecutionId;

    await retry(async done => {
      const { QueryExecution } = await this.getQueryExecution(this.executionId);

      if (QueryExecution === undefined || QueryExecution.Status === undefined) {
        throw new Error("QueryExecution is undefined");
      }

      switch (QueryExecution.Status.State) {
        case "SUCCEEDED":
          return done();
        case "FAILED":
          throw new Error(`Query is failed: ${QueryExecution.Status.StateChangeReason}`);
        case "CANCELLED":
          throw new Error("Query is cancelled");
      }
    });

    const { ResultSet } = await this.getQueryResults(this.executionId);

    return ((ResultSet && ResultSet.Rows) || []).map(r => {
      return ((r && r.Data) || []).map(d => (d.VarCharValue === undefined ? null : d.VarCharValue));
    });
  }

  cancel() {
    this.stopQueryExecution(this.executionId);
  }

  private async startQueryExecution(
    params: Athena.StartQueryExecutionInput
  ): Promise<Athena.StartQueryExecutionOutput> {
    return new Promise((resolve, reject) => {
      this.client.startQueryExecution(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async getQueryExecution(id: string): Promise<Athena.GetQueryExecutionOutput> {
    return new Promise((resolve, reject) => {
      this.client.getQueryExecution({ QueryExecutionId: id }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async getQueryResults(id: string): Promise<Athena.GetQueryResultsOutput> {
    return new Promise((resolve, reject) => {
      this.client.getQueryResults({ QueryExecutionId: id }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  private async stopQueryExecution(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.client.stopQueryExecution({ QueryExecutionId: id }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
