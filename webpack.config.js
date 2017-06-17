module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.ts', '.css', '.js', '.ne']
    },
    module: {
        loaders: [
            { test: /\.ne$/, loader: 'nearley-loader' },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader!postcss-loader"
            }
        ]
    }
};