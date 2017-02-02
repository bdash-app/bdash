import electron from 'electron';
import path from 'path';

let appRoot = path.resolve(__dirname, '..', '..');
let bdashRoot = path.resolve(electron.remote.app.getPath('home'), '.bdash');
let databasePath = path.join(bdashRoot, 'bdash.sqlite3');
let settingPath = path.join(bdashRoot, 'setting.yml');
let schemaPath = path.join(appRoot, 'db', 'schema.sql');

export default {
  appRoot,
  bdashRoot,
  databasePath,
  settingPath,
  schemaPath,
};
