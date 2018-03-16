/**
 * Based on https://github.com/AngularClass/angular-starter/blob/master
 */
const helpers = require("./helpers");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const ContextReplacementPlugin = require("webpack/lib/ContextReplacementPlugin");
const ENV = process.env.ENV = process.env.NODE_ENV = "test";

module.exports = function(options) {
    return {
        /**
         * Source map for Karma from the help of karma-sourcemap-loader & karma-webpack
         */
        devtool: "inline-source-map",

        resolve: {
            extensions: [".ts", ".js"],
            modules: [helpers.root("src"), "node_modules"]
        },

        module: {
            rules: [
                /**
                 * Source map loader support for *.js files
                 * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
                 *
                 * See: https://github.com/webpack/source-map-loader
                 */
                {
                    enforce: "pre",
                    test: /\.js$/,
                    loader: "source-map-loader",
                    exclude: [
                        /**
                         * These packages have problems with their sourcemaps.  @hci doesn't include source.
                         */
                        helpers.root("node_modules/@angular"),
                        helpers.root("node_modules/rxjs"),
                        helpers.root("node_modules/@hci")
                    ]
                },

                /**
                 * Typescript loader support for .ts and Angular 2 async routes via .async.ts
                 *
                 * See: https://github.com/s-panferov/awesome-typescript-loader
                 */
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: "awesome-typescript-loader",
                            query: {
                                /**
                                 * Use inline sourcemaps for "karma-remap-coverage" reporter
                                 */
                                sourceMap: true,
                                compilerOptions: {
                                    removeComments: true

                                }
                            },
                        },
                        "angular2-template-loader"
                    ],
                    exclude: [/\.e2e\.ts$/]
                },
                {
                    test: /\.css$/,
                    loader: ["to-string-loader", "css-loader"],
                    exclude: [helpers.root("src/index.html")]
                },
                {
                    test: /\.scss$/,
                    loader: ["raw-loader", "sass-loader"]
                },
                {
                    test: /\.html$/,
                    loader: "raw-loader"
                },
                /**
                 * Loader support for *.less files.
                 */
                {
                    test: /\.less$/,
                    loader: "raw-loader"
                },

                /**
                 * Instruments JS files with Istanbul for subsequent code coverage reporting.  Instrument only testing sources.
                 * See: https://github.com/deepsweet/istanbul-instrumenter-loader
                 */
                // Commenting out for now. "istanbul-instrumenter-loader" makes it so that source is not loaded

                // {
                //     enforce: "post",
                //     test: /\.(js|ts)$/,
                //     loader: "istanbul-instrumenter-loader",
                //     query: {
                //         esModules: true
                //     },
                //     include: helpers.root("src"),
                //     exclude: [
                //         /\.(e2e|spec)\.ts$/,
                //         /node_modules/
                //     ]
                // }

            ]
        },

        plugins: [
            new DefinePlugin({
                "ENV": JSON.stringify(ENV),
                "process.env": {
                    "ENV": JSON.stringify(ENV),
                    "NODE_ENV": JSON.stringify(ENV)
                }
            }),

            new ContextReplacementPlugin(
                /**
                 * The (\\|\/) piece accounts for path separators in *nix and Windows
                 */
                /angular(\\|\/)core(\\|\/)@angular/,
                helpers.root("src"),
                {
                    /**
                     * your Angular Async Route paths relative to this root directory
                     */
                }
            ),

            new LoaderOptionsPlugin({
                debug: false,
                options: {}
            }),
        ],

        performance: {
            hints: false
        },

        node: {
            global: true,
            process: false,
            crypto: "empty",
            module: false,
            clearImmediate: false,
            setImmediate: false
        }

    };
}
