import electron from "electron";
import path from "path";
import os from "os";

const bdashRoot =
  process.env.NODE_ENV === "test"
    ? path.join(os.tmpdir(), ".bdash")
    : path.resolve(electron.app.getPath("home"), ".bdash");
const databasePath = path.join(bdashRoot, "bdash.sqlite3");
const settingPath = path.join(bdashRoot, "setting.yml");

export default {
  bdashRoot,
  databasePath,
  settingPath,
};
