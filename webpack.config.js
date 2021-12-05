const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const webpack = require('webpack')
const TerserPlugin = require("terser-webpack-plugin")

/**
 * isDev - режим разработки
 */
const isDev = process.env.NODE_ENV === 'development'
/**
 * isProd - не isDev
 */
const isProd = !isDev

/**
 * Если режим разработки, то имя, а иначе имя.хэш
 * filename получает расширение 
 */
const filename = ext => isDev ? `[name].${ext}` : `[name].[chunkhash].${ext}`

/**
 * обработчик стилей
 * css лоадер, если есть экстра, то пуш екстра в лоадерс
 */
const cssLoaders = (extra) => {
    const loaders = [{
            loader: MiniCssExtractPlugin.loader,
            options: {},
        },
        'css-loader'
    ]

    if (extra) {
        loaders.push(extra)
    }
    return loaders
}


const babelOptions = (preset) => {
    const opts = {
            presets: ['@babel/preset-env']
    }
if (preset) {
    opts.presets.push(preset)
}
    return opts
}

/**
 * возвращает конфигурацию минимизации для режима разработки
 */
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all',
        },
        minimizer: []
    } // Используется при подключении библиотек, чтобы не дублировать код в разных файлах

    if (isProd) {
        config.minimizer = [new TerserPlugin(), new CssMinimizerPlugin()]
    }

    return config
}



/**
 * создаем массив плагинов с настройками
 */
const plugins = [
    new CleanWebpackPlugin(),
    new HTMLWebpackPlugin({
        template: './index.html',
        minify: {
            collapseWhitespace: isProd
        }
    }),
    new CopyWebpackPlugin({
        patterns: [{
            from: path.resolve(__dirname, './src/favicon.ico'),
            to: path.resolve(__dirname, 'dist')
        }]
    }),
    new MiniCssExtractPlugin({
        filename: filename('css'),
        chunkFilename: isDev ? "[id].css" : "[id].[contenthash].css",
    }),
]


// Экспортируем настройки Webpack
module.exports = {
    context: path.resolve(__dirname, 'src'), // Папка проекта, откуда брать исходные файлы
    mode: 'development', // Режим сборки
    entry: {
        main: ['@babel/polyfill', './index.jsx'], // Откуда начинать
        analytics: './analytics.ts' // Для дополнительных сторонних скриптов
    },
    // Куда складывать
    output: {
        filename: filename('js'), // Имя конечного файла
        path: path.resolve(__dirname, 'dist') // Складывать, отталкиваясь от текущей дерриктории, в папку 'dist'
    },
    resolve: {
        // extensions: ['js', '.json', 'jpg'], // сообщаем webpack, как обрабатыват файлы, если не прописано расширение в коде
        // alias: {
        //     '@assets': path.resolve(__dirname, './src/assets'), // вместо прописывания полного пути до файла можно использовать элиас типа '@assets/file'
        // }
    },
    optimization: optimization(),
    devtool: isDev ? 'source-map' : false,
    devServer: {
        historyApiFallback: true,
        open: true,
        compress: true,
        hot: isDev,
        port: 8080,
    },
    plugins,
    module: {
        rules: [{
                test: /\.css$/, // если встречаются файлы с расширением .css
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset',
                generator: {
                    filename: 'fonts/[hash][ext][query]'
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext][query]'
                }
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions()
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelOptions('@babel/preset-react')
                }
            }
        ]
    }

}