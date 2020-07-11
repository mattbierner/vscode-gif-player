"use strict";
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const production = env && env.production;
    return {
        mode: production ? 'production' : 'development',
        entry: {
            index: './src/index.tsx'
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            filename: "[name].js",
            path: path.join(__dirname, "out")
        },
        devtool: production ? '' : 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        optimization: {
            minimize: !!production,
            minimizer: [new TerserPlugin()],
        },
    };
};