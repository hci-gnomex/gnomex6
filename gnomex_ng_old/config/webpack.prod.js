const DefinePlugin = require("webpack/lib/DefinePlugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const Helpers = require("./helpers");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const OptimizeJsPlugin = require("optimize-js-plugin");
//const UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");

module.exports = function (options) {
    const Env = process.env.ENV = process.env.NODE_ENV = options.env;
    return {
        mode: 'production',
        bail: true,
        devtool: "source-map",
        output: {
            path: Helpers.root("dist"),
            publicPath: options.publicPath,
            filename: "[name].[chunkhash].bundle.js",
            sourceMapFilename: "[name].[chunkhash].bundle.map",
            chunkFilename: "[id].[chunkhash].chunk.js"
        },
        plugins: [
            new OptimizeJsPlugin({
                sourceMap: false
            }),
            new ExtractTextPlugin("[name].[contenthash].css"),
            new DefinePlugin({
                "ENV": JSON.stringify(Env),
                "process.env": {
                    "ENV": JSON.stringify(Env),
                    "NODE_ENV": JSON.stringify(Env),
                }
            }),
          /*new UglifyJsPlugin({
           beautify: false,
           output: {
           comments: false
           },
           mangle: {
           screw_ie8: true
           },
           compress: {
           screw_ie8: true,
           warnings: false,
           conditionals: true,
           unused: true,
           comparisons: true,
           sequences: true,
           dead_code: true,
           evaluate: true,
           if_return: true,
           join_vars: true,
           negate_iife: false // we need this for lazy v8
           },
           }),*/
            new LoaderOptionsPlugin({
                minimize: true,
                debug: false,
                options: {
                    /**
                     * Html loader advanced options
                     *
                     * See: https://github.com/webpack/html-loader#advanced-options
                     */
                    htmlLoader: {
                        minimize: true,
                        removeAttributeQuotes: false,
                        caseSensitive: true,
                        customAttrSurround: [
                            [/#/, /(?:)/],
                            [/\*/, /(?:)/],
                            [/\[?\(?/, /(?:)/]
                        ],
                        customAttrAssign: [/\)?\]?=/]
                    },
                }
            }),
        ]
    };
};
