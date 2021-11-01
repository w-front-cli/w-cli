const path = require("path")
/** @type { import("webpack").WebpackOptionsNormalized } */
const config = {
    entry: path.resolve(__dirname, "src"),
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist")
    },

    resolve: {
        extensions: [
            ".ts", ".json"
        ]
    },

    mode: "development",

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },

}

module.exports = config