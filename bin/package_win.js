const electronInstaller = require("electron-winstaller");
const VERSION = require("../package.json").version;

let exeFileName = `Bdash-Setup-${VERSION}.exe`;
let outDir = "./out/bdash";

electronInstaller
  .createWindowsInstaller({
    version: VERSION,
    exe: "Bdash.exe",
    setupExe: exeFileName,
    appDirectory: "./out/Bdash-win32-x64",
    outputDirectory: outDir,
    iconUrl: `file://${__dirname}/../assets/icon.ico`,
    authors: "hokaccha",
    noMsi: true
  })
  .then(() => {
    console.log(`Write ${exeFileName} to ${outDir}`);
  })
  .catch(err => {
    console.error(err);
  });
