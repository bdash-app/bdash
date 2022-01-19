import electron from "electron";
import { initMenu } from "./menu";
import logger from "./logger";
import { windows, createWindow } from "./window";

const app = electron.app;
export let mainWindow: electron.BrowserWindow | null;

process.on("uncaughtException", err => {
  logger.error(err);
});

// https://github.com/electron/electron/issues/2984#issuecomment-145419711
process.once("loaded", () => {
  global.setImmediate = setImmediate;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.whenReady().then(async () => {
  await createWindow();
  initMenu();
});

app.on("activate", async () => {
  if (windows.length === 0) {
    await createWindow();
  }
});
