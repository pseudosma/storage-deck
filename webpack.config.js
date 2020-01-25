const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        main: './src'
    },
    output: {
        filename: 'index.js',
        path: __dirname + '/lib'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: function (modulePath) {
                return modulePath.endsWith('.ts') && !modulePath.endsWith('test.ts');
              },
            loader: 'ts-loader'
        }]
    },
    optimization: {
        minimize: true,
        minimizer: [new UglifyJsPlugin()],
    }
}
