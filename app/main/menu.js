import { app } from 'electron';
import zoom from './zoom';

export default [
  {
    label: 'Application',
    submenu: [
      {
        label: 'About Bdash',
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: 'Hide Bdash',
        accelerator: 'CmdOrCtrl+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Option+CmdOrCtrl+H',
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => { app.quit(); },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: () => zoom.zoomIn() },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => zoom.zoomOut() },
      { label: 'Zoom Reset', accelerator: 'CmdOrCtrl+0', click: () => zoom.reset() },
      { type: 'separator' },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        },
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        },
      },
    ],
  },
  {
    label: 'Window', role: 'window',
    submenu: [
      { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
      { label: 'Bring All to Front', role: 'front' },
    ],
  },
];
