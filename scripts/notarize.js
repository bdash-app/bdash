const path = require("path");
const fs = require("fs");
const { notarize } = require("electron-notarize");

module.exports = async function () {
  if (process.platform !== "darwin") {
    return;
  }

  const appPath = path.resolve(__dirname, "../dist/production/mac/Bdash.app");

  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log("afterSign: Notarizing");

  await notarize({
    tool: "notarytool",
    appBundleId: "io.bdash",
    appPath: appPath,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_PASSWORD,
    teamId: process.env.ASC_PROVIDER,
  });

  console.log("afterSign: Notarized");
};
