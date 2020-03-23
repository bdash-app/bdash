import electron, { BrowserWindow } from "electron";
import path from "path";

const windows: BrowserWindow[] = [];

export async function createWindow(): Promise<void> {
  const win = new electron.BrowserWindow({
    width: 1280,
    height: 780,
    title: "Bdash",
    titleBarStyle: process.platform === "darwin" ? "hidden" : undefined,
    icon: path.join(__dirname, "..", "icon.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(`file://${__dirname}/../index.html`);
  win.once("closed", () => {
    const idx = windows.findIndex(w => w === win);
    windows.splice(idx, 1);
  });

  windows.push(win);
}

export { windows };
