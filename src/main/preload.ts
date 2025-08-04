import { contextBridge, ipcRenderer } from "electron";

// Node.js APIをwindowオブジェクトに直接追加
const nodeApis = {
  setImmediate: setImmediate,
  clearImmediate: clearImmediate,
  require: require,
  process: process,
  Buffer: Buffer,
  global: global,
};

// 既に存在しない場合のみ追加
Object.keys(nodeApis).forEach(key => {
  if (!(key in window)) {
    (window as any)[key] = (nodeApis as any)[key];
  }
});

// メインプロセスへの安全なアクセスを提供するAPIを定義
contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: () => ipcRenderer.invoke("getConfig"),
  queryCompleted: (data: any) => ipcRenderer.send("queryCompleted", data),
  showUpdateQueryDialog: () => ipcRenderer.sendSync("showUpdateQueryDialog"),

  // レンダラープロセスでIPCイベントを受信するためのメソッド
  onFormat: (callback: () => void) => {
    ipcRenderer.on("format", callback);
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Node.js APIへの安全なアクセスを提供
contextBridge.exposeInMainWorld("nodeAPI", {
  process: {
    platform: process.platform,
    versions: process.versions,
  },
  path: require("path"),
  setImmediate: setImmediate,
  require: (module: string) => {
    if (module === "./out/app") {
      return require("../../app/development/out/app");
    }
    throw new Error(`Module ${module} is not allowed`);
  },
});

// 型定義をグローバルに設定
declare global {
  interface Window {
    electronAPI: {
      getConfig: () => Promise<any>;
      queryCompleted: (data: any) => void;
      showUpdateQueryDialog: () => string;
      onFormat: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    nodeAPI: {
      process: {
        platform: string;
        versions: any;
      };
      path: any;
      setImmediate: typeof setImmediate;
      require: (module: string) => any;
    };
  }
}
