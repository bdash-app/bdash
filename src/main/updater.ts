import { dialog } from "electron";
import { autoUpdater, AppUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";
import isDev from "electron-is-dev";
import logger from "./logger";
import { mainWindow } from ".";

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
    this.autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
      this.state = UpdateState.UpdateDownloaded;
      if (mainWindow) {
        dialog
          .showMessageBox(mainWindow, {
            type: "info",
            buttons: ["Restart", "Later"],
            title: "Bdash Update",
            message: process.platform === "win32" ? (info.releaseNotes as string) : info.releaseName!,
            detail: "A new version has been downloaded. Restart the application to apply the updates."
          })
          .then(returnValue => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall();
          });
      }
    });
  }

  async check(): Promise<UpdateCheckResult | null> {
    if (isDev) return Promise.resolve(null);
    return this.autoUpdater.checkForUpdatesAndNotify();
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
