const WebpackMerge = require("webpack-merge");
const CommonConfig = require("./config/webpack.common.js");
const DevConfig = require("./config/webpack.dev");
const TestConfig = require("./config/webpack.test");
const ProdConfig = require("./config/webpack.prod");

module.exports = (env) => {
    let publicPath = env.includes('Tomcat') ? '' : '/';
    switch (env) {
        case 'test':
        case 'testing':
            return TestConfig({env: 'test'});
        case 'prod':
        case 'production':
        case 'productionTomcat':
            return WebpackMerge(CommonConfig(), ProdConfig({env: 'production', publicPath: publicPath}));
        case 'dev':
        case 'development':
        case 'developmentTomcat':
        default:
            return WebpackMerge(CommonConfig(), DevConfig({env: 'development', publicPath: publicPath}));
    }
};
