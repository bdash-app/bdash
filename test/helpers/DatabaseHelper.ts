import { connection } from "../../src/lib/Database/Connection";
import fs from "fs";

export default class DatabaseHelper {
  static initialize() {
    const schema = fs.readFileSync(`${__dirname}/../../db/schema.sql`).toString();
    return connection.initialize({ databasePath: ":memory:", schema });
  }
}
