import { connection } from '../../src/lib/Database/Connection';
import * as fs from 'fs';

export default class DatabaseHelper {
  static initialize() {
    let schema = fs.readFileSync(`${__dirname}/../../db/schema.sql`).toString();
    return connection.initialize({ databasePath: ':memory:', schema });
  }
}
