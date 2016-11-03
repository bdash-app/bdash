'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    title: 'Bdash',
  });

  mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
  mainWindow.on('closed', () => { mainWindow = null; });
});
