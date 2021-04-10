const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const buildEnv = (env && env.BUILD_ENV) || "development";
  const isDevelopment = buildEnv === "development";
  const appDir = path.join(__dirname, "app", buildEnv);
  const distDir = path.join(appDir, "out");
  const copyTargetFiles = [
    "static/index.html",
    "static/index.js",
    "static/RictyDiminished-Regular.ttf",
    "static/scatter.svg",
    "build/icon.png",
    "package.json",
    "yarn.lock"
  ];

  const extractTextPlugin = new MiniCssExtractPlugin({ filename: "app.css" });
  const copyPlugin = new CopyWebpackPlugin({
    patterns: copyTargetFiles.map(filePath => ({ from: filePath, to: appDir }))
  });
  const definePlugin = new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(buildEnv)
  });

  const commonConfig = {
    resolve: { extensions: [".ts", ".tsx", ".js"] },
    node: {
      __dirname: false,
      __filename: false
    }
  };

  const mainConfig = Object.assign(
    {
      devtool: false,
      target: "electron-main",
      entry: "./src/main/index.ts",
      output: {
        path: distDir,
        filename: "main.js"
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: { transpileOnly: isDevelopment }
          }
        ]
      },
      externals: [nodeExternals({ allowlist: ["electron-is-dev", "electron-log"] })]
    },
    commonConfig
  );

  const rendererConfig = Object.assign(
    {
      // mini-css-extract-plugin does not support "cheap-source-map".
      // See https://github.com/webpack-contrib/mini-css-extract-plugin/issues/529
      devtool: argv.mode === "production" ? "inline-source-map" : "source-map",
      target: "electron-renderer",
      entry: "./src/renderer/app.tsx",
      output: {
        clean: {
          keep(asset) {
            return asset === "main.js";
          }
        },
        path: distDir,
        filename: "app.js"
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: { transpileOnly: isDevelopment }
          },
          {
            test: /\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          {
            test: /\.(png|ttf|eot|svg|woff|woff2)(\?.+)?$/,
            type: "asset/inline"
          }
        ]
      },
      externals: [nodeExternals({ allowlist: [/\.css$/, /^aws-sdk/, /^@fortawesome/] })],
      plugins: [extractTextPlugin, definePlugin, copyPlugin]
    },
    commonConfig
  );

  return [mainConfig, rendererConfig];
};
