var commonConfig = require("./webpack.common.js");
const DefinePlugin = require("webpack/lib/DefinePlugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var helpers = require("./helpers");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
var webpackMerge = require("webpack-merge");
var Visualizer = require('webpack-visualizer-plugin');

const ENV = process.env.NODE_ENV = process.env.ENV = "development";

/**
 * Additional build information to webpack.common.js which doesn't include extra minification that
 * webpack.prod.js uses.
 *
 * @param options Just contains ENV for dev or prod builds.
 * @returns {*}
 */
module.exports = function (options) {
    return webpackMerge(commonConfig({env: ENV}), {
        devtool: "inline-source-map",

        output: {
            path: helpers.root("dist"),
            publicPath: "/",
            filename: "[name].js",
            chunkFilename: "[id].chunk.js",
            sourceMapFilename: "[file].map"
        },

        plugins: [
            new ExtractTextPlugin("[name].css"),

            new Visualizer(),

            new LoaderOptionsPlugin({
                debug: true,
                options: {}
            }),

            new DefinePlugin({
                "ENV": JSON.stringify(ENV),
                "process.env": {
                    "ENV": JSON.stringify(ENV),
                    "NODE_ENV": JSON.stringify(ENV),
                }
            }),

        ],

    });
}
