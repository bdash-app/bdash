import electron, { BrowserWindow, dialog, ipcMain, shell, Notification } from "electron";
import path from "path";
import logger from "./logger";
import Config from "./Config";

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
      contextIsolation: false,
    },
  });

  ipcMain.handle("getConfig", async () => Config);

  ipcMain.on("queryCompleted", (_event, data) => {
    const { success, title, runtime, rowCount, errorMessage } = data;

    if (!win.isFocused()) {
      const notificationTitle = success ? "Query completed" : "Query failed";
      let notificationBody;

      if (success) {
        const timeText = runtime ? ` in ${runtime}ms` : "";
        const rowText = rowCount !== undefined ? ` (${rowCount} rows)` : "";
        notificationBody = `"${title}" completed${timeText}${rowText}`;
      } else {
        const errorText = errorMessage
          ? `: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? "..." : ""}`
          : "";
        notificationBody = `"${title}" failed${errorText}`;
      }

      new Notification({
        title: notificationTitle,
        body: notificationBody,
      }).show();
    }
  });

  ipcMain.on("showUpdateQueryDialog", async (event) => {
    const { response } = await dialog.showMessageBox(win, {
      message: "This query has been already shared.",
      type: "question",
      buttons: ["Cancel", "Share as a new query", "Update an existing query"],
      defaultId: 2,
      cancelId: 0,
    });
    switch (response) {
      case 0:
        event.returnValue = "cancel";
        break;
      case 1:
        event.returnValue = "create";
        break;
      case 2:
        event.returnValue = "update";
        break;
    }
  });

  await win.loadURL(`file://${__dirname}/../index.html`);
  win.once("closed", () => {
    const idx = windows.findIndex((w) => w === win);
    windows.splice(idx, 1);
  });

  win.webContents.on("crashed", (e) => {
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
