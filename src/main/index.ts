import electron from "electron";
import { watchUpdate } from "./autoUpdater";
import menu from "./menu";

const app = electron.app;
let mainWindow;

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
  watchUpdate();
  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu));
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
