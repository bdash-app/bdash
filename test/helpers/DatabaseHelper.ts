import { connection } from "../../src/lib/Database/Connection";

export default class DatabaseHelper {
  static initialize() {
    return connection.initialize({ databasePath: ":memory:" });
  }
}
