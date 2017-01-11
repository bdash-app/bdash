import electron from 'electron';
import path from 'path';
import fs from 'fs';

let appRoot = path.resolve(__dirname, '..', '..');
let bdashRoot = path.resolve(electron.remote.app.getPath('home'), '.bdash');
let databasePath = path.join(bdashRoot, 'bdash.sqlite3');
let schemaPath = path.join(appRoot, 'db', 'schema.sql');

if (!fs.existsSync(bdashRoot)) {
  fs.mkdirSync(bdashRoot);
}

export default {
  appRoot,
  bdashRoot,
  databasePath,
  schemaPath,
};
