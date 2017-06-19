module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.ts', '.scss', '.css', '.js', '.ne']
    },
    module: {
        loaders: [
            {
                test: /\.s?css$/,
                loader: "style-loader!css-loader!postcss-loader!sass-loader"
            }, {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};