import fs from "fs";
import Config from "./Config";
import { ensureDirSync } from "fs-extra";
import { setting } from "./Setting";
import Database from "./Database";

const Bdash = {
  async initialize() {
    if (!fs.existsSync(Config.bdashRoot)) {
      ensureDirSync(Config.bdashRoot);
    }

    setting.initialize(Config.settingPath);
    await Database.connection.initialize({ databasePath: Config.databasePath });
  }
};

export default Bdash;
