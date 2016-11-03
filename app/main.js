'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const menu = require('./main/menu');

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

  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu));

  mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
  mainWindow.on('closed', () => { mainWindow = null; });
});
