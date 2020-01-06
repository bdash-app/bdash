import { connection } from "../../src/lib/Database/Connection";

export default class DatabaseHelper {
  static initialize(): Promise<void> {
    return connection.initialize({ databasePath: ":memory:" });
  }
}
