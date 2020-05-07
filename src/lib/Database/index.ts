import moment from "moment";
import { connection } from "./Connection";
import Query from "./Query";
import { QueryExecution } from "./QueryExecution";
import DataSource from "./DataSource";
import Chart from "./Chart";

export default {
  connection,
  Query,
  QueryExecution,
  DataSource,
  Chart
};

// Parse sqlite datetime as Moment
export const deserializeDateTime = (datetime: string): moment.Moment =>
  moment.utc(datetime, "YYYY-MM-DD HH:mm:ss", true).local();
