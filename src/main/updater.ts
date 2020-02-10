import { autoUpdater, AppUpdater, UpdateCheckResult } from "electron-updater";
import isDev from "electron-is-dev";
import logger from "./logger";

autoUpdater.logger = logger;

const WATCH_INTERVAL = 60 * 60 * 1000; // 1 hour

export enum UpdateState {
  UpdateNotAvailable,
  UpdateDownloaded
}

export class Updater {
  state: UpdateState = UpdateState.UpdateNotAvailable;
  readonly autoUpdater: AppUpdater;

  constructor(autoUpdater: AppUpdater) {
    this.autoUpdater = autoUpdater;
    this.autoUpdater.on("update-downloaded", () => {
      this.state = UpdateState.UpdateDownloaded;
    });
  }

  async check(): Promise<UpdateCheckResult | void> {
    if (isDev) return Promise.resolve();
    return this.autoUpdater.checkForUpdates();
  }

  async watch(): Promise<void> {
    await this.check();
    setInterval(async () => await this.check(), WATCH_INTERVAL);
  }

  quit() {
    this.autoUpdater.quitAndInstall();
  }
}

export const updater = new Updater(autoUpdater);
