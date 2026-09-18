const path = require('path');

/** @type {import('webpack').Configuration} */
const node_build = {
    name: "node",
    mode: "development",
    devtool: "inline-source-map",
    target: "node",
    entry: {
        main: "./src/ayr.ts",
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "ayr.js",
        //library: { type: "module" },
    },
    //experiments: {
    //    outputModule: true,
    //},
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    //externalsType: "module",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    }
};

/** @type {import('webpack').Configuration} */
const browser_build = {
    name: "browser",
    mode: "development",
    devtool: "inline-source-map",
    target: "web",
    entry: {
        ayr: "./src/eval.ts",
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "ayr.web.js",
        library: { type: "module" },
    },
    //experiments: {
    //    outputModule: true,
    //},
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    }
};

module.exports = [node_build, browser_build];
