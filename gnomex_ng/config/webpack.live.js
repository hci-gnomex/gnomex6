/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
const { merge } = require("webpack-merge");
const devConfig = require("./webpack.dev.js");

/**
 * A webpack configuration for a "live" development deployment.
 *
 * @author brandony <brandon.youkstetter@hci.utah.edu>
 * @since 7/18/16
 */
module.exports = merge(devConfig, {
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "tslint",
                enforce: "pre"
            }
        ]
    },

    devServer: {
        historyApiFallback: true,
        stats: "minimal"
    },

});
