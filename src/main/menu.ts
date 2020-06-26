import { app, Menu, dialog, shell } from "electron";
import { updater, UpdateState } from "./updater";
import isDev from "electron-is-dev";
import { createWindow } from "./window";

const editMenu: Electron.MenuItemConstructorOptions = {
  label: "Edit",
  submenu: [{ role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }]
};

const viewMenu: Electron.MenuItemConstructorOptions = {
  label: "View",
  submenu: [
    { role: "toggleDevTools" },
    { type: "separator" },
    { role: "resetZoom" },
    { role: "zoomIn" },
    { role: "zoomOut" }
  ]
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
      }
    },
    { role: "minimize" },
    { role: "close" }
  ]
};

const helpMenu: Electron.MenuItemConstructorOptions = {
  role: "help",
  submenu: [
    {
      label: "Report Issue",
      click(): void {
        shell.openExternal("https://github.com/bdash-app/bdash/issues/new");
      }
    }
  ]
};

const checkForUpdateItem: Electron.MenuItemConstructorOptions = {
  label: "Check for Updates...",
  click() {
    switch (updater.state) {
      case UpdateState.UpdateNotAvailable: {
        const message = "There are currently no updates available.";
        dialog.showMessageBox({ message });
        return;
      }
      case UpdateState.UpdateDownloaded: {
        const message = "There is an available update. Restart app to apply the latest update.";
        const buttons = ["Update Now", "Later"];
        dialog.showMessageBox({ message, buttons }).then(result => {
          if (result.response === 0) {
            updater.quit();
          }
        });
        return;
      }
    }
  }
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
      { role: "quit" }
    ]
  });
} else if (Array.isArray(helpMenu.submenu)) {
  helpMenu.submenu.push(checkForUpdateItem);
  template.unshift({
    label: "File",
    submenu: [{ role: "quit" }]
  });
}

export function initMenu(): void {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
