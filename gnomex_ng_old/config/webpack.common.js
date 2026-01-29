const Webpack = require("webpack");
const Helpers = require("./helpers");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = () => {
    return {
        entry: {
            polyfills: "./src/polyfills.ts",
            vendor: "./src/vendor.ts",
            app: "./src/main.ts"
        },
        resolve: {
            extensions: [".ts", ".js"],
            modules: [Helpers.root("src"), Helpers.root("node_modules")]
        },
        devServer: {
            host: '0.0.0.0',
            port: 8080,
            proxy: {
                '/gnomex': {
                    target: 'http://localhost',
                    secure: false
                }
            },
            contentBase: './dist'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: "@angularclass/hmr-loader"
                        },
                        {
                            loader: "awesome-typescript-loader",
                            options: {
                                configFileName: "tsconfig.json"
                            }
                        },
                        {
                            loader: "angular2-template-loader"
                        }
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/, /node_modules/]
                },
                {
                    // Images and fonts are bundled as well.
                    test: /\.(png|jpe?g|gif|ico)$/,
                    use: "file-loader?name=assets/[name].[hash].[ext]"
                },
                {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader?sourceMap"}),
                    exclude: [Helpers.root("src", "assets")]
                },
                {
                    test: /\.less$/,
                    use: ExtractTextPlugin.extract({use: ["css-loader", "less-loader"], fallback: "style-loader"})
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "raw-loader"
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                includePaths: ["node_modules"]
                            }
                        }
                    ]
                },
                {
                    test: /bootstrap\/dist\/js\/umd\//,
                    use: "imports-loader?jQuery=jquery"
                },
                {
                    test: /\.html$/,
                    use: "html-loader"
                },
                {
                    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=application/octet-stream"
                },
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                    use: "file-loader"
                },
                {
                    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                    use: "url-loader?limit=10000&mimetype=image/svg+xml"
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "src/index.html",
            }),
            new CopyWebpackPlugin([
                {
                    from: "src/favicon.ico",
                    to: "favicon.ico"
                },
                {
                    from: "src/assets",
                    to: "assets"
                },
                {
                    from: "src/data",
                    to: "data"
                }
            ]),
            new Webpack.NamedModulesPlugin(),
            new Webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery",
                Tether: "tether",
                "window.Tether": "tether",
                Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
                Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
                Button: "exports-loader?Button!bootstrap/js/dist/button",
                Collapse: "exports-loader?Collapse!bootstrap/js/dist/collapse",
                Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
                Modal: "exports-loader?Modal!bootstrap/js/dist/modal",
                Tab: "exports-loader?Tab!bootstrap/js/dist/tab",
                Util: "exports-loader?Util!bootstrap/js/dist/util",
                Popper: ['popper.js', 'default']
            })
        ]
    };
};
