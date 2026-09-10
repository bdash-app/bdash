import electron, { BrowserWindow, dialog, ipcMain, shell, Notification, nativeTheme } from "electron";
import path from "path";
import logger from "./logger";
import Config from "./Config";
import { SettingType, ThemeSettingType } from "src/lib/Setting";

const windows: BrowserWindow[] = [];

type NativeThemeState = {
  shouldUseDarkColors: boolean;
  themeSource: ThemeSettingType;
};

const getNativeThemeState = (): NativeThemeState => ({
  shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
  themeSource: nativeTheme.themeSource as ThemeSettingType,
});

const sendNativeThemeUpdate = (): void => {
  const payload = getNativeThemeState();
  windows.forEach((w) => {
    if (!w.isDestroyed() && !w.webContents.isDestroyed()) {
      w.webContents.send("native-theme-updated", payload);
    }
  });
};

const shouldNotify = (setting: SettingType, isFocused: boolean) => {
  return (
    setting.notification.enabled &&
    (setting.notification.when === "always" ||
      (setting.notification.when === "focusing" && isFocused) ||
      (setting.notification.when === "not_focusing" && !isFocused))
  );
};

let ipcHandlersRegistered = false;

const registerIpcHandlers = (): void => {
  if (ipcHandlersRegistered) return;
  ipcHandlersRegistered = true;

  ipcMain.handle("getNativeTheme", () => getNativeThemeState());

  ipcMain.handle("setThemeSource", (_event, themeSource: ThemeSettingType) => {
    nativeTheme.themeSource = themeSource;
    sendNativeThemeUpdate();
    return getNativeThemeState();
  });

  nativeTheme.on("updated", sendNativeThemeUpdate);

  ipcMain.handle("getConfig", async () => Config);

  ipcMain.on("queryCompleted", (event, data) => {
    const { success, title, runtime, rowCount, errorMessage, _setting } = data;
    const win = BrowserWindow.fromWebContents(event.sender);

    if (shouldNotify(_setting, win?.isFocused() ?? false)) {
      const notificationTitle = success ? "✅️ Query completed" : "❌️ Query failed";
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
    const win = BrowserWindow.fromWebContents(event.sender);
    const options: electron.MessageBoxOptions = {
      message: "This query has been already shared.",
      type: "question",
      buttons: ["Cancel", "Share as a new query", "Update an existing query"],
      defaultId: 2,
      cancelId: 0,
    };
    const { response } = win ? await dialog.showMessageBox(win, options) : await dialog.showMessageBox(options);
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
};

export async function createWindow(): Promise<void> {
  registerIpcHandlers();

  const win = new electron.BrowserWindow({
    width: 1280,
    height: 780,
    title: "Bdash",
    icon: path.join(__dirname, "..", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  await win.loadURL(`file://${__dirname}/../index.html`);
  win.once("closed", () => {
    const idx = windows.findIndex((w) => w === win);
    windows.splice(idx, 1);
  });

  win.webContents.on("render-process-gone", (e, details) => {
    logger.error("renderer process crashed", e, details);
    dialog.showErrorBox("Bdash is crashed", "Unrecoverable error");
  });

  win.webContents.on("will-navigate", async (e, url) => {
    e.preventDefault();
    await shell.openExternal(url);
  });

  windows.push(win);
  sendNativeThemeUpdate();
}

export { windows };
