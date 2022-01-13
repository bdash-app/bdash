import * as athena from "@aws-sdk/client-athena";
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
  client: athena.AthenaClient;
  executionId: string;

  constructor(config: AthenaClientConfig) {
    const { region, accessKeyId, secretAccessKey } = config;
    this.config = config;
    this.client = new athena.AthenaClient({
      region,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! }
    });
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

    const { QueryExecutionId } = await this.client.send(new athena.StartQueryExecutionCommand(params));
    if (QueryExecutionId === undefined) throw new Error("QueryExecutionId is undefined");
    this.executionId = QueryExecutionId;

    await retry(async done => {
      const { QueryExecution } = await this.client.send(
        new athena.GetQueryExecutionCommand({ QueryExecutionId: this.executionId })
      );

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

    let rows = [];
    let nextToken: string | undefined = undefined;
    for (;;) {
      const result = await this.client.send(
        new athena.GetQueryResultsCommand({ QueryExecutionId: this.executionId, NextToken: nextToken })
      );
      nextToken = result.NextToken;
      const rs = ((result.ResultSet && result.ResultSet.Rows) || []).map(r => {
        return ((r && r.Data) || []).map(d => (d.VarCharValue === undefined ? null : d.VarCharValue));
      });
      rows = rows.concat(rs);
      if (!nextToken) {
        break;
      }
    }

    return rows;
  }

  cancel(): void {
    this.client.send(new athena.StopQueryExecutionCommand({ QueryExecutionId: this.executionId }));
  }
}
