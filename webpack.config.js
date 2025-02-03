const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {DefinePlugin} = require("webpack");

module.exports = (env = {}) => {
  const isProduction = env.production === true; // Pass --env production in scripts

  return {
    entry: "./src/index.ts",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  localIdentName: "[local]",
                  namedExport: true,
                },
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ["svg-inline-loader"],
        },
        {
          test: /\.(jpe?g|png|gif)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
      }),
      new DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(
          isProduction ? "production" : "development"
        ),
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, "dist"),
      hot: true,
      liveReload: true,
      watchFiles: ["src/**/*"],
      port: 3000,
      open: true,
    },
  };
};
