import fs from "fs";
import Config from "./Config";
import { ensureDirSync } from "fs-extra";
import { setting } from "./Setting";
import Database from "./Database";

const Bdash = {
  async initialize(): Promise<void> {
    // @see https://github.com/bdash-app/bdash/pull/99#issuecomment-590011101
    window.process["browser"] = true;
    if (!fs.existsSync(Config.bdashRoot)) {
      ensureDirSync(Config.bdashRoot);
    }

    setting.initialize(Config.settingPath);
    await Database.connection.initialize({ databasePath: Config.databasePath });
  },
};

export default Bdash;
