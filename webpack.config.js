const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssWebpackPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TereserWepackPlugin = require('terser-webpack-plugin');
const autoprefixer = require('autoprefixer');


const isDirEmpty = (dir) => !fs.readdirSync(dir).length;
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        },
        minimizer: [],
    }
    
    if (isProd) {
        config.minimizer.push(
            new TereserWepackPlugin(),
            new OptimizeCssAssetsWebpackPlugin()
        )
    }

    return config;
}

const getPlugins = () => {
    const plugings = [
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: isProd
        }),
        new CleanWebpackPlugin(),
        new MiniCssWebpackPlugin({
            filename: filename('.css')
        }),
    ];

    const copyImages = !isDirEmpty('./src/assets/images') ?
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/assets/images'),
                    to: path.resolve(__dirname, 'dist/assets/images')
                }
            ]
        })
        : null;

    if (copyImages) plugins.push(copyImages);
    return plugings;
}


module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: './index.js',
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    optimization: optimization(),
    devServer: {
        port: 3000,
        hot: true,
        historyApiFallback: true
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.css'],
    },
    plugins: getPlugins(),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ]
                    }
                }
            }, {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssWebpackPlugin.loader,
                        options: {
                            modules: true,
                            importLoaders: 1,
                            hmr: true,
                            reloadAll: true
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer()
                            ],
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    }
}
