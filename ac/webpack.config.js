module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.ts', '.css', '.js', '.xml']
    },
    module: {
        loaders: [
            // { test: /\.ne$/, loader: 'nearley-loader' },
            // {
            //     test: /\.s?css$/,
            //     loader: "style-loader!css-loader!postcss-loader!sass-loader"
            // },
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.xml$/, loader: 'xml-loader' }
        ]
    }
};