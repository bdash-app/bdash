import { connection } from '../../app/lib/Database/Connection';
import fs from 'fs';

export default class DatabaseHelper {
  constructor() {
    let schema = fs.readFileSync(`${__dirname}/../../db/schema.sql`).toString();
    connection.initialize({ databasePath: ':memory:', schema });
    this.connection = connection;
  }
}
