import electron from "electron";
import path from "path";
import dotenv from "dotenv";

const appRoot = path.resolve(__dirname, "..");
dotenv.load({ path: path.join(appRoot, ".env") });

const env = process.env.BDASH_ENV || "development";
const bdashRoot = process.env.BDASH_ROOT || path.resolve(electron.remote.app.getPath("home"), ".bdash");
const databasePath = path.join(bdashRoot, "bdash.sqlite3");
const settingPath = path.join(bdashRoot, "setting.yml");
const schemaPath = path.join(appRoot, "db", "schema.sql");

export default {
  env,
  appRoot,
  bdashRoot,
  databasePath,
  settingPath,
  schemaPath
};
