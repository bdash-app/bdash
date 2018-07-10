const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = env => {
  const buildEnv = (env && env.BUILD_ENV) || "development";
  const isDevelopment = buildEnv === "development";
  const appDir = `./app/${buildEnv}`;
  const distDir = `${appDir}/out`;
  const copyTargetFiles = [
    "static/index.html",
    "static/index.js",
    "static/RictyDiminished-Regular.ttf",
    "package.json",
    "yarn.lock"
  ];

  const extractTextPlugin = new ExtractTextPlugin({ filename: `${distDir}/app.css` });
  const cleanPlugin = new CleanWebpackPlugin(appDir);
  const copyPlugin = new CopyWebpackPlugin(copyTargetFiles.map(filePath => ({ from: filePath, to: appDir })));
  const definePlugin = new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(buildEnv)
  });

  const commonConfig = {
    resolve: { extensions: [".ts", ".tsx"] },
    devtool: "source-map",
    node: {
      __dirname: false,
      __filename: false
    },
    externals: [nodeExternals({ whitelist: [/\.css$/] })]
  };

  const mainConfig = Object.assign(
    {
      target: "electron-main",
      entry: "./src/main/index.ts",
      output: { filename: `${distDir}/main.js` },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: { transpileOnly: isDevelopment }
          }
        ]
      }
    },
    commonConfig
  );

  const rendererConfig = Object.assign(
    {
      target: "electron-renderer",
      entry: "./src/renderer/app.tsx",
      output: { filename: `${distDir}/app.js` },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: { transpileOnly: isDevelopment }
          },
          {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
              loader: "css-loader",
              options: { sourceMap: true }
            })
          },
          {
            test: /\.(png|ttf|eot|svg|woff|woff2)(\?.+)?$/,
            loader: "url-loader"
          }
        ]
      },
      plugins: [extractTextPlugin, definePlugin, cleanPlugin, copyPlugin]
    },
    commonConfig
  );

  return [mainConfig, rendererConfig];
};
