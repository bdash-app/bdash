import fs from "fs";
import { ensureDirSync } from "fs-extra";
import { setting } from "./Setting";
import Database from "./Database";
import { ipcRenderer } from "electron";

const Bdash = {
  async initialize(): Promise<void> {
    // @see https://github.com/bdash-app/bdash/pull/99#issuecomment-590011101
    window.process["browser"] = true;

    const Config = await ipcRenderer.invoke("getConfig");

    if (!fs.existsSync(Config.bdashRoot)) {
      ensureDirSync(Config.bdashRoot);
    }

    setting.initialize(Config.settingPath);
    await Database.connection.initialize({ databasePath: Config.databasePath });
  },
};

export default Bdash;
