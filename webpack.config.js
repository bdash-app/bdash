module.exports = env => {
  const webpack = require("webpack");
  const nodeExternals = require("webpack-node-externals");
  const ExtractTextPlugin = require("extract-text-webpack-plugin");
  const nodeEnv = (env && env.NODE_ENV) || "development";
  const isProduction = nodeEnv === "production";
  const distDir = isProduction ? "./tmp/app/out" : "./app/out";

  const definePlugin = new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(nodeEnv)
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
            options: { transpileOnly: !isProduction }
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
            options: { transpileOnly: !isProduction }
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
      plugins: [new ExtractTextPlugin({ filename: `${distDir}/app.css` }), definePlugin]
    },
    commonConfig
  );

  return [mainConfig, rendererConfig];
};
