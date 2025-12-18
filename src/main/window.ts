import electron, { BrowserWindow, dialog, ipcMain, shell, Notification, nativeTheme } from "electron";
import path from "path";
import logger from "./logger";
import Config from "./Config";
import { SettingType, ThemeSettingType } from "src/lib/Setting";

const LIGHT_BACKGROUND_COLOR = "#ffffff";
const DARK_BACKGROUND_COLOR = "#0f172a";

const windows: BrowserWindow[] = [];

type NativeThemeState = {
  shouldUseDarkColors: boolean;
  themeSource: ThemeSettingType;
};

const getBackgroundColor = (shouldUseDarkColors: boolean): string =>
  shouldUseDarkColors ? DARK_BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR;

const getNativeThemeState = (): NativeThemeState => ({
  shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
  themeSource: nativeTheme.themeSource as ThemeSettingType,
});

const sendNativeThemeUpdate = (): void => {
  const payload = getNativeThemeState();
  windows.forEach((w) => {
    if (!w.isDestroyed() && !w.webContents.isDestroyed()) {
      w.webContents.send("native-theme-updated", payload);
      w.setBackgroundColor(getBackgroundColor(payload.shouldUseDarkColors));
    }
  });
};

let nativeThemeHandlersRegistered = false;

const registerNativeThemeHandlers = (): void => {
  if (nativeThemeHandlersRegistered) return;

  ipcMain.handle("getNativeTheme", () => getNativeThemeState());

  ipcMain.handle("setThemeSource", (_event, themeSource: ThemeSettingType) => {
    nativeTheme.themeSource = themeSource;
    sendNativeThemeUpdate();
    return getNativeThemeState();
  });

  nativeTheme.on("updated", sendNativeThemeUpdate);
  nativeThemeHandlersRegistered = true;
};

const shouldNotify = (setting: SettingType, isFocused: boolean) => {
  return (
    setting.notification.enabled &&
    (setting.notification.when === "always" ||
      (setting.notification.when === "focusing" && isFocused) ||
      (setting.notification.when === "not_focusing" && !isFocused))
  );
};

export async function createWindow(): Promise<void> {
  registerNativeThemeHandlers();

  const win = new electron.BrowserWindow({
    width: 1280,
    height: 780,
    title: "Bdash",
    titleBarStyle: process.platform === "darwin" ? "hidden" : undefined,
    icon: path.join(__dirname, "..", "icon.png"),
    // Use light background as default to minimize flash for most users.
    // The correct theme will be applied after settings are loaded in renderer.
    backgroundColor: LIGHT_BACKGROUND_COLOR,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  ipcMain.handle("getConfig", async () => Config);

  ipcMain.on("queryCompleted", (_event, data) => {
    const { success, title, runtime, rowCount, errorMessage, _setting } = data;

    if (shouldNotify(_setting, win.isFocused())) {
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
