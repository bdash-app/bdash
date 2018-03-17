import electron from "electron";
import path from "path";

const bdashRoot = process.env.BDASH_ROOT || path.resolve(electron.remote.app.getPath("home"), ".bdash");
const databasePath = path.join(bdashRoot, "bdash.sqlite3");
const settingPath = path.join(bdashRoot, "setting.yml");

export default {
  bdashRoot,
  databasePath,
  settingPath
};
