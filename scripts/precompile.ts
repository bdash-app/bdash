/* eslint-disable no-console */
import { resolve } from "path";
import fse from "fs-extra";

function normalizePath(path: string): string {
  return resolve(__dirname, "..", path);
}

function rm(path: string): void {
  fse.removeSync(normalizePath(path));
}

function cp(paths: string[], targetDir: string): void {
  const dir = normalizePath(targetDir);
  paths.forEach(path => {
    const fileName = path.split("/").pop();
    fse.copyFileSync(normalizePath(path), `${dir}/${fileName}`);
  });
}

function mkdir(path: string): void {
  fse.ensureDirSync(normalizePath(path));
}

const distDir = "tmp/app";
const targetFiles = ["app/index.html", "app/index.js", "package.json", "yarn.lock"];

console.log(`remove: ${distDir}`);
rm(distDir);

console.log(`mkdir: ${distDir}`);
mkdir(distDir);

console.log(`copy: ${targetFiles} to ${distDir}`);
cp(targetFiles, distDir);
