const Helpers = require("./helpers");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin");
const ContextReplacementPlugin = require("webpack/lib/ContextReplacementPlugin");

module.exports = (options) => {
    const Env = process.env.ENV = process.env.NODE_ENV = options.env;
    return {
        /**
         * Source map for Karma from the help of karma-sourcemap-loader & karma-webpack
         */
        devtool: "inline-source-map",
        resolve: {
            extensions: [".ts", ".js"],
            modules: [Helpers.root("src"), "node_modules"]
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
                    use: "source-map-loader",
                    exclude: [
                        /**
                         * These packages have problems with their sourcemaps.  @hci doesn't include source.
                         */
                        Helpers.root("node_modules/@angular"),
                        Helpers.root("node_modules/rxjs"),
                        Helpers.root("node_modules/@hci")
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
                            use: "awesome-typescript-loader",
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
                    use: ["to-string-loader", "css-loader"],
                    exclude: [Helpers.root("src/index.html")]
                },
                {
                    test: /\.scss$/,
                    use: ["raw-loader", "sass-loader"]
                },
                {
                    test: /\.html$/,
                    use: "raw-loader"
                },
                /**
                 * Loader support for *.less files.
                 */
                {
                    test: /\.less$/,
                    use: "raw-loader"
                },
                /**
                 * Instruments JS files with Istanbul for subsequent code coverage reporting.  Instrument only testing sources.
                 * See: https://github.com/deepsweet/istanbul-instrumenter-loader
                 */
                // Commenting out for now. "istanbul-instrumenter-loader" makes it so that source is not loaded
                // {
                //     enforce: "post",
                //     test: /\.(js|ts)$/,
                //     use: "istanbul-instrumenter-loader",
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
                "ENV": JSON.stringify(Env),
                "process.env": {
                    "ENV": JSON.stringify(Env),
                    "NODE_ENV": JSON.stringify(Env)
                }
            }),
            new ContextReplacementPlugin(
                /**
                 * The (\\|\/) piece accounts for path separators in *nix and Windows
                 */
                /angular(\\|\/)core(\\|\/)@angular/,
                Helpers.root("src"),
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
};
