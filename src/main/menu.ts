import { app, Menu, dialog, shell } from "electron";
import isDev from "electron-is-dev";
import { createWindow } from "./window";
import path from "path";
import logger from "./logger";
import { checkUpdate } from "./updateChecker";

const editMenu: Electron.MenuItemConstructorOptions = {
  label: "Edit",
  submenu: [
    { role: "cut" },
    { role: "copy" },
    { role: "paste" },
    { role: "selectAll" },
    {
      label: "format query",
      accelerator: "CmdOrCtrl+Shift+F",
      click(_item, focusedWindow): void {
        focusedWindow?.webContents.send("format");
      },
    },
  ],
};

const viewMenu: Electron.MenuItemConstructorOptions = {
  label: "View",
  submenu: [
    { role: "toggleDevTools" },
    { type: "separator" },
    { role: "resetZoom" },
    { role: "zoomIn" },
    { role: "zoomOut" },
  ],
};

if (isDev && Array.isArray(viewMenu.submenu)) {
  viewMenu.submenu.unshift({ role: "reload" });
}

const windowMenu: Electron.MenuItemConstructorOptions = {
  role: "window",
  submenu: [
    {
      label: "New Window",
      accelerator: "CmdOrCtrl+Shift+N",
      click(): void {
        createWindow();
      },
    },
    { role: "minimize" },
    { role: "close" },
  ],
};

const helpMenu: Electron.MenuItemConstructorOptions = {
  role: "help",
  submenu: [
    {
      label: "Report Issue",
      click(): void {
        shell.openExternal("https://github.com/bdash-app/bdash/issues/new");
      },
    },
  ],
};

const checkForUpdateItem: Electron.MenuItemConstructorOptions = {
  label: "Check for Updates...",
  click: async () => {
    const shouldUpdate = await checkUpdate().catch((err) => {
      logger.error(err);
      return false;
    });
    const message = shouldUpdate
      ? "There is an available update. Download and install from here.\nhttps://github.com/bdash-app/bdash/releases/latest"
      : "There are currently no updates available.";
    dialog.showMessageBox({ message });
    return;
  },
};

const template: Electron.MenuItemConstructorOptions[] = [editMenu, viewMenu, windowMenu, helpMenu];

if (process.platform === "darwin") {
  template.unshift({
    label: app.name,
    submenu: [
      { role: "about" },
      checkForUpdateItem,
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  });
} else if (Array.isArray(helpMenu.submenu)) {
  helpMenu.submenu.push({ type: "separator" });
  helpMenu.submenu.push({ role: "about" });
  helpMenu.submenu.push(checkForUpdateItem);
  template.unshift({
    label: "File",
    submenu: [{ role: "quit" }],
  });
}

export function initMenu(): void {
  const iconPath = isDev
    ? path.join(__dirname, "..", "..", "..", "build", "icon.png")
    : path.join(process.resourcesPath, "build", "icon.png");
  app.setAboutPanelOptions({
    applicationName: "Bdash",
    applicationVersion: app.getVersion(),
    iconPath,
  });
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
