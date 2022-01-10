import electron, { BrowserWindow, dialog, shell } from "electron";
import path from "path";
import logger from "./logger";

const windows: BrowserWindow[] = [];

export async function createWindow(): Promise<void> {
  const win = new electron.BrowserWindow({
    width: 1280,
    height: 780,
    title: "Bdash",
    titleBarStyle: process.platform === "darwin" ? "hidden" : undefined,
    icon: path.join(__dirname, "..", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  await win.loadURL(`file://${__dirname}/../index.html`);
  win.once("closed", () => {
    const idx = windows.findIndex(w => w === win);
    windows.splice(idx, 1);
  });

  win.webContents.on("crashed", e => {
    logger.error("renderer process crashed", e);
    dialog.showErrorBox("Bdash is crashed", "Unrecoverable error");
  });

  win.webContents.on("will-navigate", async (e, url) => {
    e.preventDefault();
    await shell.openExternal(url);
  });

  windows.push(win);
}

export { windows };
