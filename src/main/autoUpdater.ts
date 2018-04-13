import { autoUpdater } from "electron-updater";
import log from "electron-log";

const WATCH_INTERVAL = 60 * 60 * 1000; // 1 hour

log.transports.file.level = "debug";
autoUpdater.logger = log;

export function watchUpdate() {
  autoUpdater.checkForUpdatesAndNotify();

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, WATCH_INTERVAL);
}
