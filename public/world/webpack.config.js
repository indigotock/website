module.exports = {
    entry: "./src/index.ts",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.ts', '.css', '.js', '.ne']
    },
    module: {
        loaders: [{
                test: /\.ne$/,
                loader: 'nearley-loader'
            },
            {
                test: /\.s?css$/,
                loader: "style-loader!css-loader!postcss-loader!sass-loader"
            },
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    }
};