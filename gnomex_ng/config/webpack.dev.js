const DefinePlugin = require("webpack/lib/DefinePlugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Helpers = require("./helpers");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
//const Visualizer = require('webpack-visualizer-plugin');

module.exports = (options) => {
    const Env = process.env.ENV = process.env.NODE_ENV = options.env;
    return {
        mode: 'development',
        devtool: "inline-source-map",
        output: {
            path: Helpers.root("dist"),
            publicPath: options.publicPath,
            filename: "[name].js",
            chunkFilename: "[id].chunk.js",
            sourceMapFilename: "[file].map"
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css"
            }),
            //new Visualizer(),
            new LoaderOptionsPlugin({
                debug: true,
                options: {}
            }),
            new DefinePlugin({
                "ENV": JSON.stringify(Env),
                "process.env": {
                    "ENV": JSON.stringify(Env),
                    "NODE_ENV": JSON.stringify(Env),
                }
            }),
        ],
    };
};
