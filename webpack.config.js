const {merge} = require('webpack-merge');
const {resolve} = require('path');
const pkg = require("./package.json");

const config = {
    entry: resolve(__dirname, 'src/index.ts'),
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: resolve(__dirname, 'tsconfig.json')
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx', '.json'],
        mainFields: ['es2015', 'esm2015', 'fesm2015', 'browser', 'module', 'main']
    },
    output: {
        filename: '[name].js',
        // library: pkg.name
    }
};

module.exports = [
    merge(config, {
        optimization: {
            minimize: false
        },
        output: {
            path: resolve(__dirname, 'dist/bundles'),
            filename: 'data-mapping.umd.js',
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    }),
    merge(config, {
        optimization: {
            minimize: true
        },
        output: {
            path: resolve(__dirname, 'dist/bundles'),
            filename: 'data-mapping.umd.min.js',
            libraryTarget: 'umd',
            umdNamedDefine: true
        }
    }),
    merge(config, {
        optimization: {
            minimize: false
        },
        output: {
            path: resolve(__dirname, 'dist/esm2015'),
            libraryTarget: 'module'
        }
    })
]
