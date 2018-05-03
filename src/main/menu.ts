import { app, Menu, dialog } from "electron";
import { updater, UpdateState } from "./updater";
import isDev from "electron-is-dev";

const editMenu: Electron.MenuItemConstructorOptions = {
  label: "Edit",
  submenu: [{ role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectall" }]
};

const viewMenu: Electron.MenuItemConstructorOptions = {
  label: "View",
  submenu: [
    { role: "toggledevtools" },
    { type: "separator" },
    { role: "resetzoom" },
    { role: "zoomin" },
    { role: "zoomout" }
  ]
};

if (isDev && Array.isArray(viewMenu.submenu)) {
  viewMenu.submenu.unshift({ role: "reload" });
}

const windowMenu: Electron.MenuItemConstructorOptions = {
  role: "window",
  submenu: [{ role: "minimize" }, { role: "close" }]
};

const helpMenu: Electron.MenuItemConstructorOptions = {
  role: "help",
  submenu: [
    {
      label: "Report Issue",
      click() {
        require("electron").shell.openExternal("https://github.com/bdash-app/bdash/issues/new");
      }
    }
  ]
};

const checkForUpdateItem = {
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
        dialog.showMessageBox({ message, buttons }, buttonIndex => {
          if (buttonIndex === 0) {
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
    label: app.getName(),
    submenu: [
      { role: "about" },
      checkForUpdateItem,
      { type: "separator" },
      { role: "hide" },
      { role: "hideothers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" }
    ]
  });
} else if (Array.isArray(helpMenu.submenu)) {
  helpMenu.submenu.push(checkForUpdateItem);
}

export function initMenu() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
