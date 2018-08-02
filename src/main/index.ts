import electron from "electron";
import { updater } from "./updater";
import { initMenu } from "./menu";
import logger from "./logger";

const app = electron.app;
let mainWindow;

process.on("uncaughtException", err => {
  logger.error(err);
});

function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 780,
    title: "Bdash"
  });

  mainWindow.loadURL(`file://${__dirname}/../index.html`);
  mainWindow.once("closed", () => {
    mainWindow = null;
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", () => {
  createWindow();
  updater.watch();
  initMenu();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
