const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV,
  
  devtool: process.env.NODE_ENV == "development" ? 'inline-source-map' : undefined,
  
  devServer: {
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },

  entry: './src/sonic/main.ts',
  output: {
    path: path.resolve(__dirname, "public/js"),
    filename: 'opensonic.js'
  },
  plugins: [
  ],
  module: {
    rules: [
      // Typescript
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },

      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: ['babel-loader'] },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  }
}