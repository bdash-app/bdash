import electron from 'electron';
import path from 'path';
import dotenv from 'dotenv';

let appRoot = path.resolve(__dirname, '..', '..');
dotenv.load({ path: path.join(appRoot, '.env') });

let env = process.env.BDASH_ENV || 'development';
let bdashRoot = process.env.BDASH_ROOT || path.resolve(electron.remote.app.getPath('home'), '.bdash');
let databasePath = path.join(bdashRoot, 'bdash.sqlite3');
let settingPath = path.join(bdashRoot, 'setting.yml');
let schemaPath = path.join(appRoot, 'db', 'schema.sql');

export default {
  env,
  appRoot,
  bdashRoot,
  databasePath,
  settingPath,
  schemaPath,
};
