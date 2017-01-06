import electron from 'electron';
import menu from './main/menu';

let app = electron.app;
let mainWindow;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 780,
    title: 'Bdash',
  });

  electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu));

  mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
  mainWindow.on('closed', () => { mainWindow = null; });
});
